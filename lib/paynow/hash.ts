import { createHash } from "crypto";

// Paynow's hash scheme (from the official Node SDK, src/paynow.ts):
// concatenate every field VALUE (excluding "hash" itself) in the order the
// fields were added to the payload, append the integration key
// lowercased, SHA512 the result, then uppercase the hex digest. The same
// algorithm is used to sign outbound requests and to verify inbound
// responses/notifications.
export function generateHash(
  fields: Record<string, string>,
  integrationKey: string
): string {
  let combined = "";
  for (const key of Object.keys(fields)) {
    if (key === "hash") continue;
    combined += fields[key];
  }
  combined += integrationKey.toLowerCase();

  return createHash("sha512").update(combined, "utf8").digest("hex").toUpperCase();
}

export function verifyHash(
  fields: Record<string, string>,
  integrationKey: string
): boolean {
  const receivedHash = fields.hash;
  if (!receivedHash) return false;
  return receivedHash === generateHash(fields, integrationKey);
}

// Paynow sends responses as a form-urlencoded string (key=value&key=value),
// not JSON.
export function parseFormEncoded(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = (body.startsWith("?") ? body.slice(1) : body).split("&");
  for (const pair of pairs) {
    if (!pair) continue;
    const [rawKey, rawValue = ""] = pair.split("=");
    result[decodeURIComponent(rawKey.replace(/\+/g, "%20"))] = decodeURIComponent(
      rawValue.replace(/\+/g, "%20")
    );
  }
  return result;
}
