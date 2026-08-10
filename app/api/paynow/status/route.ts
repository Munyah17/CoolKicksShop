import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaynowProvider } from "@/lib/paynow";
import { processPaynowResult } from "@/lib/orders/processPaynowResult";
import type { OrderRow, PaymentRow } from "@/types/database";

// Secondary/recovery path: the order confirmation page polls this while
// payment is still "pending". If Paynow's result notification hasn't
// arrived yet, we actively ask Paynow for the transaction's status and
// process it through the same idempotent pipeline the webhook uses. This
// is what makes "customer pays, browser crashes, they never come back to
// this page" still resolve correctly -- the webhook alone already handles
// that, this just gives an honest live status to anyone who IS watching.
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle<OrderRow>();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.payment_status === "pending") {
    const { data: payment } = await admin
      .from("payments")
      .select("*")
      .eq("order_id", order.id)
      .maybeSingle<PaymentRow>();

    if (payment?.poll_url) {
      const status = await getPaynowProvider().pollTransaction(payment.poll_url);
      if (status.success) {
        await processPaynowResult(status.raw);
      }
    }
  }

  const { data: refreshed } = await admin
    .from("orders")
    .select("payment_status, order_status")
    .eq("reference", reference)
    .single<Pick<OrderRow, "payment_status" | "order_status">>();

  return NextResponse.json({
    paymentStatus: refreshed?.payment_status ?? order.payment_status,
    orderStatus: refreshed?.order_status ?? order.order_status,
  });
}
