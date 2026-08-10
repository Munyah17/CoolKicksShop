// Shared "integration key" used only by the local dev mock checkout, so
// the mock provider and the dev-only routes that sign/verify on its
// behalf all agree on the same secret. Never used when real Paynow
// credentials are configured (see lib/paynow/index.ts).
export const MOCK_INTEGRATION_KEY = "dev-mock-key";
