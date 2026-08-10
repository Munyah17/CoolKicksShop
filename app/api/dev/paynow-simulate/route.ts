import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateHash } from "@/lib/paynow/hash";
import { MOCK_INTEGRATION_KEY } from "@/lib/paynow/mockKey";
import { processPaynowResult } from "@/lib/orders/processPaynowResult";
import type { OrderRow, PaymentRow } from "@/types/database";

// Dev-only: the "Simulate Paid / Cancelled / Failed" buttons on
// /dev/paynow call this. It builds the exact same field set a real Paynow
// notification would contain and pushes it through processPaynowResult --
// the real verification + idempotent state-transition code, not a
// shortcut. This route does not exist in production builds.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { reference, outcome } = (await request.json().catch(() => ({}))) as {
    reference?: string;
    outcome?: "paid" | "cancelled" | "failed";
  };

  if (!reference || !outcome) {
    return NextResponse.json({ error: "Missing reference or outcome." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const statusWord = outcome === "paid" ? "Paid" : outcome === "cancelled" ? "Cancelled" : "Failed";

  const fields: Record<string, string> = {
    reference: order.reference,
    amount: Number(payment.amount).toFixed(2),
    paynowreference: `MOCK-${order.reference}`,
    pollurl: `${request.nextUrl.origin}/api/paynow/mock-poll?reference=${encodeURIComponent(order.reference)}`,
    status: statusWord,
  };
  fields.hash = generateHash(fields, MOCK_INTEGRATION_KEY);

  const result = await processPaynowResult(fields);
  return NextResponse.json(result);
}
