export interface PaynowInitiateParams {
  reference: string;
  amount: number;
  additionalInfo: string;
  authEmail?: string;
  returnUrl: string;
}

export interface PaynowInitiateResult {
  success: boolean;
  browserUrl?: string;
  pollUrl?: string;
  error?: string;
}

export interface PaynowStatusResult {
  success: boolean;
  status?: string;
  amount?: string;
  paynowReference?: string;
  reference?: string;
  error?: string;
  raw: Record<string, string>;
}

// A Paynow provider knows how to talk to Paynow's hosted checkout. There
// are two implementations: the real HTTP client, and a mock used in
// development when no Paynow credentials are configured. Nothing outside
// this folder should care which one is active.
export interface PaynowProvider {
  initiateTransaction(params: PaynowInitiateParams): Promise<PaynowInitiateResult>;
  pollTransaction(pollUrl: string): Promise<PaynowStatusResult>;
  verifyNotification(fields: Record<string, string>): boolean;
}
