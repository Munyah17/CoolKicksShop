import "server-only";
import { siteUrl } from "@/lib/config";
import { PaynowClient } from "./client";
import { MockPaynowProvider } from "./mock";
import { MOCK_INTEGRATION_KEY } from "./mockKey";
import type { PaynowProvider } from "./types";

// True only when we're deliberately running against the local mock
// checkout instead of Paynow's live API.
export const isPaynowMockMode = !process.env.PAYNOW_INTEGRATION_ID || !process.env.PAYNOW_INTEGRATION_KEY;

let cached: PaynowProvider | null = null;

// Built lazily (on first request) rather than at module load, so that
// `next build`'s static page-data collection -- which evaluates route
// modules without a real request -- never trips the production guard
// below. The guard still runs before any request is actually served.
export function getPaynowProvider(): PaynowProvider {
  if (cached) return cached;

  const integrationId = process.env.PAYNOW_INTEGRATION_ID;
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY;

  if ((!integrationId || !integrationKey) && process.env.NODE_ENV === "production") {
    // Never allow a production deploy to silently fall back to fake
    // payments because an env var was missed.
    throw new Error("PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY are missing in production.");
  }

  if (!integrationId || !integrationKey) {
    console.warn(
      "[paynow] No PAYNOW_INTEGRATION_ID/PAYNOW_INTEGRATION_KEY set -- using the local mock checkout. This must never happen in production."
    );
    cached = new MockPaynowProvider({ integrationKey: MOCK_INTEGRATION_KEY, siteUrl: siteUrl() });
  } else {
    cached = new PaynowClient({
      integrationId,
      integrationKey,
      resultUrl: siteUrl("/api/paynow/result"),
    });
  }

  return cached;
}
