import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initiatePaynowPayment } from "@/lib/orders/initiatePayment";
import { CheckoutError } from "@/lib/orders/errors";
import type { OrderRow } from "@/types/database";

// Lets a customer retry payment on an order that failed/was cancelled
// without creating a duplicate order.
export async function POST(request: NextRequest) {
  const { reference } = (await request.json().catch(() => ({}))) as { reference?: string };
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

  if (order.payment_status === "paid") {
    return NextResponse.json({ error: "This order has already been paid." }, { status: 400 });
  }

  try {
    // A retry after cancel/fail should give the order a clean pending
    // state again before sending the customer back to Paynow.
    if (order.payment_status !== "pending") {
      await admin
        .from("orders")
        .update({ payment_status: "pending", order_status: "pending_payment" })
        .eq("id", order.id);
      await admin.from("payments").update({ status: "pending" }).eq("order_id", order.id);
    }

    const browserUrl = await initiatePaynowPayment(order);
    return NextResponse.json({ redirectUrl: browserUrl });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/paynow/retry] unexpected error", err);
    return NextResponse.json({ error: "Could not restart payment. Please try again." }, { status: 500 });
  }
}
