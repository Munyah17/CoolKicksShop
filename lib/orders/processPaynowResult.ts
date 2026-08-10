import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaynowProvider } from "@/lib/paynow";
import { toCents } from "@/lib/money";
import type { OrderItemRow, PaymentRow } from "@/types/database";

export interface ProcessResult {
  ok: boolean;
  message: string;
}

// The single authoritative place where a Paynow status update (whether it
// arrived via the result notification webhook or via polling) is turned
// into a payment/order state change. Verifies the hash, verifies the
// amount, and is idempotent: replaying the exact same notification never
// double-decrements stock or double-confirms an order.
export async function processPaynowResult(fields: Record<string, string>): Promise<ProcessResult> {
  const provider = getPaynowProvider();

  if (!provider.verifyNotification(fields)) {
    console.error("[paynow] rejected notification with invalid hash", fields.reference);
    return { ok: false, message: "Invalid signature." };
  }

  const reference = fields.reference;
  if (!reference) {
    return { ok: false, message: "Missing reference." };
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("merchant_reference", reference)
    .maybeSingle<PaymentRow>();

  if (!payment) {
    console.error(`[paynow] notification for unknown order reference ${reference}`);
    return { ok: false, message: "Unknown order." };
  }

  const receivedAmountCents = Math.round(parseFloat(fields.amount ?? "0") * 100);
  const expectedAmountCents = toCents(payment.amount);
  if (receivedAmountCents !== expectedAmountCents) {
    console.error(
      `[paynow] amount mismatch for ${reference}: expected ${expectedAmountCents} got ${receivedAmountCents}`
    );
    return { ok: false, message: "Amount mismatch." };
  }

  const status = (fields.status ?? "").toLowerCase();

  if (status === "paid" || status === "awaiting delivery" || status === "delivered") {
    return markPaid(payment, fields);
  }

  if (status === "cancelled") {
    return markTerminal(payment, "cancelled", fields);
  }

  if (status === "failed") {
    return markTerminal(payment, "failed", fields);
  }

  if (status === "disputed" || status === "refunded") {
    // Out of scope for the simple order flow -- log for manual admin
    // follow-up rather than silently changing state.
    console.warn(`[paynow] order ${reference} reported as ${status}; needs manual review`);
    return { ok: true, message: `Noted ${status}; needs manual review.` };
  }

  // "Created" / "Sent" / other transient pre-final statuses -- nothing to do yet.
  return { ok: true, message: `Status ${fields.status} is not final; ignored.` };
}

async function markPaid(payment: PaymentRow, fields: Record<string, string>): Promise<ProcessResult> {
  const admin = createAdminClient();

  // Conditional update: only transitions rows that are not already paid,
  // making duplicate notifications a no-op.
  const { data: updatedPayment } = await admin
    .from("payments")
    .update({
      status: "paid",
      paynow_reference: fields.paynowreference ?? null,
      raw_last_status: fields.status ?? null,
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", payment.id)
    .neq("status", "paid")
    .select()
    .maybeSingle<PaymentRow>();

  if (!updatedPayment) {
    return { ok: true, message: "Already processed." };
  }

  await admin
    .from("orders")
    .update({ payment_status: "paid", order_status: "paid" })
    .eq("id", payment.order_id);

  const { data: items } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", payment.order_id)
    .returns<OrderItemRow[]>();

  for (const item of items ?? []) {
    if (!item.product_size_id) continue;
    const { data: decremented } = await admin.rpc("decrement_product_stock", {
      p_size_id: item.product_size_id,
      p_qty: item.quantity,
    });
    if (!decremented) {
      console.warn(
        `[orders] order ${payment.merchant_reference}: insufficient stock left for size id ${item.product_size_id} at confirmation time -- flagged for admin review`
      );
    }
  }

  console.info(`[orders] order ${payment.merchant_reference} marked paid`);
  return { ok: true, message: "Payment confirmed." };
}

async function markTerminal(
  payment: PaymentRow,
  status: "cancelled" | "failed",
  fields: Record<string, string>
): Promise<ProcessResult> {
  const admin = createAdminClient();

  const { data: updatedPayment } = await admin
    .from("payments")
    .update({ status, raw_last_status: fields.status ?? null, last_checked_at: new Date().toISOString() })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select()
    .maybeSingle<PaymentRow>();

  if (!updatedPayment) {
    return { ok: true, message: "Already processed." };
  }

  await admin
    .from("orders")
    .update({ payment_status: status, order_status: "cancelled" })
    .eq("id", payment.order_id)
    .eq("order_status", "pending_payment");

  console.info(`[orders] order ${payment.merchant_reference} marked ${status}`);
  return { ok: true, message: `Payment ${status}.` };
}
