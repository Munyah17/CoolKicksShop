import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation/checkout";
import { createOrderFromCheckout } from "@/lib/orders/createOrder";
import { initiatePaynowPayment } from "@/lib/orders/initiatePayment";
import { CheckoutError } from "@/lib/orders/errors";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { order } = await createOrderFromCheckout(parsed.data, user?.id ?? null);
    const browserUrl = await initiatePaynowPayment(order);
    return NextResponse.json({ reference: order.reference, redirectUrl: browserUrl });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/checkout] unexpected error", err);
    return NextResponse.json(
      { error: "Something went wrong creating your order. Please try again." },
      { status: 500 }
    );
  }
}
