import Link from "next/link";
import { getActiveDeliveryOptions } from "@/lib/catalogue/queries";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const [deliveryOptions, { data: { user } }] = await Promise.all([
    getActiveDeliveryOptions(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Checkout</h1>

      {!user && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-sm text-neutral-700">
            Have an account? Sign in for faster checkout and order history. You can also continue
            as a guest below — an account isn&apos;t required.
          </p>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/account/login?next=/checkout"
              className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
            >
              Sign In
            </Link>
            <Link
              href="/account/signup"
              className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:bg-neutral-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      <CheckoutForm deliveryOptions={deliveryOptions} />
    </div>
  );
}
