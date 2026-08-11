import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.legalName}.`,
};

export default function AboutPage() {
  return (
    <LegalPage title={`About ${siteConfig.legalName}`}>
      <p>
        {siteConfig.legalName} is a Zimbabwean sneaker boutique built around one idea: a small,
        hand-picked selection beats an overwhelming catalogue. We started on Instagram, sharing
        pairs we&apos;d genuinely wear ourselves, and {siteConfig.brandName} is that same shop,
        online.
      </p>
      <p>
        Every pair we list is chosen deliberately — no filler, no warehouse dump. If it&apos;s on
        the site, it&apos;s something we&apos;d put on our own feet.
      </p>
      <p>
        We ship across Zimbabwe and offer free pickup for anyone nearby. Payment is handled
        securely through Paynow, so your card details never touch our servers.
      </p>
    </LegalPage>
  );
}
