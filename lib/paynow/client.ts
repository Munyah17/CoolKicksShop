import "server-only";
import { generateHash, parseFormEncoded, verifyHash } from "./hash";
import { parseStatusResponse } from "./parseStatus";
import type {
  PaynowInitiateParams,
  PaynowInitiateResult,
  PaynowProvider,
  PaynowStatusResult,
} from "./types";

const INITIATE_TRANSACTION_URL = "https://www.paynow.co.zw/interface/initiatetransaction";

interface PaynowClientOptions {
  integrationId: string;
  integrationKey: string;
  resultUrl: string;
}

export class PaynowClient implements PaynowProvider {
  constructor(private options: PaynowClientOptions) {}

  async initiateTransaction(params: PaynowInitiateParams): Promise<PaynowInitiateResult> {
    // Field order matters: Paynow's server recomputes the hash by
    // concatenating field values in this exact order.
    const fields: Record<string, string> = {
      resulturl: this.options.resultUrl,
      returnurl: params.returnUrl,
      reference: params.reference,
      amount: params.amount.toFixed(2),
      id: this.options.integrationId,
      additionalinfo: params.additionalInfo,
      authemail: params.authEmail ?? "",
      status: "Message",
    };
    fields.hash = generateHash(fields, this.options.integrationKey);

    let responseText: string;
    try {
      const response = await fetch(INITIATE_TRANSACTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fields).toString(),
      });
      responseText = await response.text();
    } catch (err) {
      console.error("[paynow] initiateTransaction network error", err);
      return { success: false, error: "Could not reach Paynow. Please try again." };
    }

    const parsed = parseFormEncoded(responseText);

    if ((parsed.status ?? "").toLowerCase() === "error") {
      return { success: false, error: parsed.error || "Paynow rejected the transaction." };
    }

    if (!verifyHash(parsed, this.options.integrationKey)) {
      console.error("[paynow] initiateTransaction hash mismatch", parsed);
      return { success: false, error: "Could not verify Paynow's response." };
    }

    return {
      success: true,
      browserUrl: parsed.browserurl,
      pollUrl: parsed.pollurl,
    };
  }

  async pollTransaction(pollUrl: string): Promise<PaynowStatusResult> {
    let responseText: string;
    try {
      const response = await fetch(pollUrl, { method: "POST" });
      responseText = await response.text();
    } catch (err) {
      console.error("[paynow] pollTransaction network error", err);
      return { success: false, error: "Could not reach Paynow.", raw: {} };
    }

    const parsed = parseFormEncoded(responseText);
    return parseStatusResponse(parsed, this.options.integrationKey);
  }

  // Used for the inbound POST /api/paynow/result notification -- the
  // fields there are the same shape as a poll response.
  verifyNotification(fields: Record<string, string>): boolean {
    return verifyHash(fields, this.options.integrationKey);
  }
}
