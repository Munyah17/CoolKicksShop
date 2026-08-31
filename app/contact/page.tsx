import type { Metadata } from "next";
import { siteConfig, whatsappLink } from "@/lib/config";
import { getSiteSettings } from "@/lib/catalogue/queries";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.legalName}.`,
};

function instagramHandle(url: string): string {
  const match = url.match(/instagram\.com\/([^/?]+)/i);
  return match ? `@${match[1]}` : url;
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const instagramUrl = settings?.instagram_url || siteConfig.instagramUrl;
  const whatsappNumber = settings?.whatsapp_number || siteConfig.whatsappNumber;
  const contactEmail = settings?.contact_email || siteConfig.contactEmail;
  const phone = settings?.phone;
  const address = settings?.address;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Contact</h1>
      <p className="mt-3 text-sm text-neutral-700">
        Questions about sizing, a specific pair, or an existing order? Reach us here:
      </p>

      <div className="mt-8 space-y-4">
        {instagramUrl && <ContactRow label="Instagram" value={instagramHandle(instagramUrl)} href={instagramUrl} />}
        {whatsappNumber && (
          <ContactRow label="WhatsApp" value={whatsappNumber} href={whatsappLink(undefined, whatsappNumber)} />
        )}
        {phone && <ContactRow label="Phone" value={phone} href={`tel:${phone.replace(/\s/g, "")}`} />}
        {contactEmail && <ContactRow label="Email" value={contactEmail} href={`mailto:${contactEmail}`} />}
        {address && <ContactRow label="Address" value={address} />}
      </div>
    </div>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </>
  );
  const className = "flex items-center justify-between border border-border bg-white px-5 py-4 transition hover:border-neutral-400";

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={className}
    >
      {content}
    </a>
  );
}
