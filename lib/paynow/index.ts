import "server-only";
import { siteUrl } from "@/lib/config";
import { PaynowClient } from "./client";
import { MockPaynowProvider } from "./mock";
import { MOCK_INTEGRATION_KEY } from "./mockKey";
import type { PaynowProvider } from "./types";

const integrationId = process.env.PAYNOW_INTEGRATION_ID;
const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;

// True only when we're deliberately running against the local mock
// checkout instead of Paynow's live API.
export const isPaynowMockMode = !integrationId || !integrationKey;

if (isPaynowMockMode && process.env.NODE_ENV === "production") {
  // Never allow a production deploy to silently fall back to fake
  // payments because an env var was missed.
  throw new Error(
    "PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY are missing in a production build."
  );
}

let provider: PaynowProvider;

if (isPaynowMockMode) {
  console.warn(
    "[paynow] No PAYNOW_INTEGRATION_ID/PAYNOW_INTEGRATION_KEY set -- using the local mock checkout. This must never happen in production."
  );
  provider = new MockPaynowProvider({
    integrationKey: MOCK_INTEGRATION_KEY,
    siteUrl: siteUrl(),
  });
} else {
  provider = new PaynowClient({
    integrationId: integrationId!,
    integrationKey: integrationKey!,
    resultUrl: siteUrl("/api/paynow/result"),
  });
}

export function getPaynowProvider(): PaynowProvider {
  return provider;
}
