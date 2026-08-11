import type { Metadata } from "next";
import { siteConfig, whatsappLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.legalName}.`,
};

export default function ContactPage() {
  const hasWhatsapp = Boolean(siteConfig.whatsappNumber);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Contact</h1>
      <p className="mt-3 text-sm text-neutral-700">
        Questions about sizing, a specific pair, or an existing order? Reach us here:
      </p>

      <div className="mt-8 space-y-4">
        <ContactRow
          label="Instagram"
          value="@coolkicksklan"
          href={siteConfig.instagramUrl}
        />
        {hasWhatsapp && <ContactRow label="WhatsApp" value={siteConfig.whatsappNumber} href={whatsappLink()} />}
        {siteConfig.contactEmail && (
          <ContactRow label="Email" value={siteConfig.contactEmail} href={`mailto:${siteConfig.contactEmail}`} />
        )}
      </div>
    </div>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-center justify-between border border-border bg-white px-5 py-4 transition hover:border-neutral-400"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </a>
  );
}
