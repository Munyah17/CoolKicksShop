import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/lib/config";
import { fromCents, toCents } from "@/lib/money";
import { CheckoutError } from "./errors";
import type { CheckoutInput } from "@/lib/validation/checkout";
import type {
  DeliveryOptionRow,
  OrderItemRow,
  OrderRow,
  PaymentRow,
  ProductRow,
  ProductSizeRow,
} from "@/types/database";

interface DraftItem {
  product_id: string;
  product_size_id: string;
  product_name: string;
  size: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

// The single place that turns "what the browser says is in the cart" into
// an authoritative order. Every price, every stock check, and the
// delivery fee are all re-read from the database here -- nothing the
// client sent is trusted except product ids, sizes and quantities.
export async function createOrderFromCheckout(
  input: CheckoutInput
): Promise<{ order: OrderRow; items: OrderItemRow[]; payment: PaymentRow }> {
  const admin = createAdminClient();

  const deliveryOption = await resolveDeliveryOption(input);

  // Merge duplicate (product, size) lines in case the client sent the
  // same line twice.
  const merged = new Map<string, { productId: string; size: string; quantity: number }>();
  for (const item of input.items) {
    const key = `${item.productId}::${item.size}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(key, { productId: item.productId, size: item.size, quantity: item.quantity });
    }
  }

  const draftItems: DraftItem[] = [];

  for (const line of merged.values()) {
    const { data: product } = await admin
      .from("products")
      .select("*, product_sizes(*)")
      .eq("id", line.productId)
      .eq("active", true)
      .maybeSingle<ProductRow & { product_sizes: ProductSizeRow[] }>();

    if (!product) {
      throw new CheckoutError("One of the items in your cart is no longer available.");
    }

    const sizeRow = product.product_sizes.find((s) => s.size === line.size);
    if (!sizeRow) {
      throw new CheckoutError(`${product.name} in size ${line.size} is no longer available.`);
    }
    if (sizeRow.stock < line.quantity) {
      throw new CheckoutError(
        sizeRow.stock > 0
          ? `${product.name} (size ${line.size}) only has ${sizeRow.stock} left in stock.`
          : `${product.name} (size ${line.size}) is out of stock.`
      );
    }

    const unitPrice = product.sale_price ?? product.price;
    const lineTotal = fromCents(toCents(unitPrice) * line.quantity);

    draftItems.push({
      product_id: product.id,
      product_size_id: sizeRow.id,
      product_name: product.name,
      size: line.size,
      unit_price: unitPrice,
      quantity: line.quantity,
      line_total: lineTotal,
    });
  }

  const subtotalCents = draftItems.reduce((sum, item) => sum + toCents(item.line_total), 0);
  const deliveryFee = deliveryOption.fee;
  const totalCents = subtotalCents + toCents(deliveryFee);

  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_name: input.customerName,
      phone: input.phone,
      email: input.email || null,
      address: input.deliveryMethod === "delivery" ? input.address : null,
      city: input.deliveryMethod === "delivery" ? input.city : null,
      delivery_notes: input.notes || null,
      delivery_option_id: deliveryOption.id,
      delivery_method: input.deliveryMethod,
      delivery_fee: deliveryFee,
      subtotal: fromCents(subtotalCents),
      total: fromCents(totalCents),
      currency: siteConfig.currency,
    })
    .select()
    .single<OrderRow>();

  if (orderError || !order) {
    console.error("[orders] failed to create order", orderError);
    throw new Error("Could not create order.");
  }

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .insert(draftItems.map((item) => ({ ...item, order_id: order.id })))
    .select<"*", OrderItemRow>();

  if (itemsError || !items) {
    console.error("[orders] failed to create order items, rolling back order", itemsError);
    await admin.from("orders").delete().eq("id", order.id);
    throw new Error("Could not create order.");
  }

  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .insert({
      order_id: order.id,
      provider: "paynow",
      merchant_reference: order.reference,
      amount: order.total,
      currency: order.currency,
      status: "pending",
    })
    .select()
    .single<PaymentRow>();

  if (paymentError || !payment) {
    console.error("[orders] failed to create payment record, rolling back order", paymentError);
    await admin.from("orders").delete().eq("id", order.id);
    throw new Error("Could not create order.");
  }

  console.info(`[orders] created order ${order.reference} total=${order.total}`);

  return { order, items, payment };
}

async function resolveDeliveryOption(input: CheckoutInput): Promise<DeliveryOptionRow> {
  const admin = createAdminClient();

  if (input.deliveryMethod === "pickup") {
    const { data } = await admin
      .from("delivery_options")
      .select("*")
      .eq("type", "pickup")
      .eq("active", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle<DeliveryOptionRow>();

    if (!data) throw new CheckoutError("Pickup is not currently available.");
    return data;
  }

  const { data } = await admin
    .from("delivery_options")
    .select("*")
    .eq("id", input.deliveryOptionId)
    .eq("type", "delivery")
    .eq("active", true)
    .maybeSingle<DeliveryOptionRow>();

  if (!data) throw new CheckoutError("Please choose a valid delivery area.");
  return data;
}
