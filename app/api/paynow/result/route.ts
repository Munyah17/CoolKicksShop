import { NextRequest, NextResponse } from "next/server";
import { parseFormEncoded } from "@/lib/paynow/hash";
import { processPaynowResult } from "@/lib/orders/processPaynowResult";

// This is Paynow's server-to-server notification endpoint (the
// "resulturl"). It is the authoritative source of truth for payment
// status -- never the browser redirect to /order/[reference]. Paynow may
// call this more than once for the same transaction; processPaynowResult
// is idempotent.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const fields = parseFormEncoded(rawBody);

  const result = await processPaynowResult(fields);
  if (!result.ok) {
    console.error("[api/paynow/result]", result.message, fields.reference);
  }

  // Always acknowledge with 200 so Paynow doesn't endlessly retry a
  // notification we've already understood (even ones we chose not to
  // act on, e.g. an amount mismatch we're logging for review).
  return new NextResponse("ok", { status: 200 });
}
