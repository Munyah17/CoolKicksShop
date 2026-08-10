import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig, siteUrl } from "@/lib/config";
import { getPaynowProvider } from "@/lib/paynow";
import { CheckoutError } from "./errors";
import type { OrderRow } from "@/types/database";

// Starts (or restarts) a Paynow transaction for an existing order and
// returns the hosted checkout URL to redirect the customer to. Reused by
// both the initial checkout and "try payment again".
export async function initiatePaynowPayment(order: OrderRow): Promise<string> {
  const provider = getPaynowProvider();

  const result = await provider.initiateTransaction({
    reference: order.reference,
    amount: order.total,
    additionalInfo: `${siteConfig.legalName} order ${order.reference}`,
    authEmail: order.email ?? undefined,
    returnUrl: siteUrl(`/order/${order.reference}?check=1`),
  });

  if (!result.success || !result.browserUrl) {
    console.error(`[paynow] failed to initiate transaction for ${order.reference}`, result.error);
    throw new CheckoutError(
      result.error || "We couldn't start your payment right now. Please try again."
    );
  }

  const admin = createAdminClient();
  await admin
    .from("payments")
    .update({ poll_url: result.pollUrl ?? null })
    .eq("order_id", order.id);

  console.info(`[paynow] initiated transaction for ${order.reference}`);

  return result.browserUrl;
}
