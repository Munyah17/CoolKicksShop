import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { getSiteSettings } from "@/lib/catalogue/queries";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.legalName}.`,
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const customParagraphs = settings?.about_content?.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <LegalPage title={`About ${siteConfig.legalName}`}>
      {customParagraphs && customParagraphs.length > 0 ? (
        customParagraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)
      ) : (
        <>
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
        </>
      )}
    </LegalPage>
  );
}
