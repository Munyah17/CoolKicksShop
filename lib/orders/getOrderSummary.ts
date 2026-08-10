import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItemRow, OrderRow, PaymentRow } from "@/types/database";

// Order references are short and sequential, so this page is reachable by
// anyone who can guess a nearby reference -- not just the customer who
// placed the order. We deliberately return only what's needed to show an
// order confirmation (items, totals, statuses), never phone/email/full
// street address.
export interface OrderSummary {
  reference: string;
  createdAt: string;
  deliveryMethod: OrderRow["delivery_method"];
  city: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentStatus: OrderRow["payment_status"];
  orderStatus: OrderRow["order_status"];
  items: Array<{ productName: string; size: string; unitPrice: number; quantity: number; lineTotal: number }>;
  pollUrl: string | null;
}

export async function getOrderSummary(reference: string): Promise<OrderSummary | null> {
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle<OrderRow>();

  if (!order) return null;

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .returns<OrderItemRow[]>();

  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("order_id", order.id)
    .maybeSingle<PaymentRow>();

  return {
    reference: order.reference,
    createdAt: order.created_at,
    deliveryMethod: order.delivery_method,
    city: order.city,
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    total: order.total,
    currency: order.currency,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    items: (items ?? []).map((item) => ({
      productName: item.product_name,
      size: item.size,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      lineTotal: item.line_total,
    })),
    pollUrl: payment?.poll_url ?? null,
  };
}
