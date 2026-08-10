import "server-only";
import { generateHash, parseFormEncoded } from "./hash";
import { parseStatusResponse } from "./parseStatus";
import type {
  PaynowInitiateParams,
  PaynowInitiateResult,
  PaynowProvider,
  PaynowStatusResult,
} from "./types";

interface MockPaynowOptions {
  integrationKey: string;
  siteUrl: string;
}

// Stands in for Paynow during local development when no real credentials
// are configured. It never fakes a "paid" result directly -- it hands the
// browser off to an internal /dev/paynow page, which (when the developer
// clicks a button) sends a real, hash-signed notification through the same
// /api/paynow/result verification pipeline the live integration uses. This
// class is only ever selected outside production; see lib/paynow/index.ts.
export class MockPaynowProvider implements PaynowProvider {
  constructor(private options: MockPaynowOptions) {}

  async initiateTransaction(params: PaynowInitiateParams): Promise<PaynowInitiateResult> {
    const pollUrl = `${this.options.siteUrl}/api/paynow/mock-poll?reference=${encodeURIComponent(
      params.reference
    )}`;
    const browserUrl = `${this.options.siteUrl}/dev/paynow?reference=${encodeURIComponent(
      params.reference
    )}&amount=${encodeURIComponent(params.amount.toFixed(2))}`;

    return { success: true, browserUrl, pollUrl };
  }

  async pollTransaction(pollUrl: string): Promise<PaynowStatusResult> {
    const response = await fetch(pollUrl, { method: "POST" });
    const text = await response.text();
    return parseStatusResponse(parseFormEncoded(text), this.options.integrationKey);
  }

  verifyNotification(fields: Record<string, string>): boolean {
    const receivedHash = fields.hash;
    if (!receivedHash) return false;
    return receivedHash === generateHash(fields, this.options.integrationKey);
  }
}
