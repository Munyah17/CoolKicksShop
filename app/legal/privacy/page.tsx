import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {siteConfig.legalName} collects only what&apos;s needed to fulfil your order: your name,
        phone number, delivery address or pickup preference, and optionally your email. You do
        not need to create an account to buy from us.
      </p>
      <p>
        <strong className="text-neutral-900">Payment information.</strong> We never collect,
        see, or store your card or mobile money details. Payment is handled entirely by Paynow
        Zimbabwe on their secure, hosted checkout.
      </p>
      <p>
        <strong className="text-neutral-900">How we use your information.</strong> Order details
        are used to fulfil and deliver your order, and to contact you about it. We don&apos;t
        sell your information to third parties.
      </p>
      <p>
        <strong className="text-neutral-900">Contact.</strong> To ask about the information we
        hold about you, reach us via our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>
        .
      </p>
    </LegalPage>
  );
}
