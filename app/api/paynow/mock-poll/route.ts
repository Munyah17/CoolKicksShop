import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateHash } from "@/lib/paynow/hash";
import { MOCK_INTEGRATION_KEY } from "@/lib/paynow/mockKey";
import type { OrderRow, PaymentRow } from "@/types/database";

// Dev-only stand-in for Paynow's pollurl endpoint: reports whatever the
// payments table currently says for this order, signed the same way a
// real Paynow poll response would be.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) return new NextResponse("status=Error&error=missing+reference", { status: 200 });

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle<OrderRow>();
  const { data: payment } = order
    ? await admin.from("payments").select("*").eq("order_id", order.id).maybeSingle<PaymentRow>()
    : { data: null };

  if (!order || !payment) {
    return new NextResponse("status=Error&error=unknown+reference", { status: 200 });
  }

  const statusWord = payment.status === "paid" ? "Paid" : payment.status === "cancelled" ? "Cancelled" : payment.status === "failed" ? "Failed" : "Created";

  const fields: Record<string, string> = {
    reference: order.reference,
    amount: Number(payment.amount).toFixed(2),
    paynowreference: payment.paynow_reference ?? `MOCK-${order.reference}`,
    pollurl: `${request.nextUrl.origin}/api/paynow/mock-poll?reference=${encodeURIComponent(order.reference)}`,
    status: statusWord,
  };
  fields.hash = generateHash(fields, MOCK_INTEGRATION_KEY);

  return new NextResponse(new URLSearchParams(fields).toString(), { status: 200 });
}
