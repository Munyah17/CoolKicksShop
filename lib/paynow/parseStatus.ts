import { verifyHash } from "./hash";
import type { PaynowStatusResult } from "./types";

// Shared by the real client's pollTransaction and the dev mock provider so
// both go through identical verification logic.
export function parseStatusResponse(
  parsed: Record<string, string>,
  integrationKey: string
): PaynowStatusResult {
  if ((parsed.status ?? "").toLowerCase() === "error") {
    return { success: false, error: parsed.error || "Paynow returned an error.", raw: parsed };
  }

  if (!verifyHash(parsed, integrationKey)) {
    console.error("[paynow] status hash mismatch", parsed);
    return { success: false, error: "Could not verify Paynow's response.", raw: parsed };
  }

  return {
    success: true,
    status: parsed.status,
    amount: parsed.amount,
    paynowReference: parsed.paynowreference,
    reference: parsed.reference,
    raw: parsed,
  };
}
