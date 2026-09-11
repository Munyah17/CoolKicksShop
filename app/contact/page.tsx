import type { Metadata } from "next";
import { siteConfig, whatsappLink } from "@/lib/config";
import { getSiteSettings } from "@/lib/catalogue/queries";
import { PhoneIcon, MailIcon, LocationIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.legalName}.`,
};

// No per-visitor data on this page -- static + ISR instead of rendering
// fresh on every request.
export const revalidate = 60;

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
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Contact</h1>
      <p className="mt-3 text-sm text-neutral-700">
        Questions about sizing, a specific pair, or an existing order? Reach us here:
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {phone && (
          <ContactTile
            icon={<PhoneIcon className="h-5 w-5" />}
            label="Phone"
            value={phone}
            href={`tel:${phone.replace(/\s/g, "")}`}
          />
        )}
        {whatsappNumber && (
          <ContactTile
            icon={<WhatsAppIcon className="h-5 w-5" />}
            label="WhatsApp"
            value={whatsappNumber}
            href={whatsappLink(undefined, whatsappNumber)}
          />
        )}
        {contactEmail && (
          <ContactTile
            icon={<MailIcon className="h-5 w-5" />}
            label="Email"
            value={contactEmail}
            href={`mailto:${contactEmail}`}
          />
        )}
        {instagramUrl && (
          <ContactTile
            icon={<InstagramIcon className="h-5 w-5" />}
            label="Instagram"
            value={instagramHandle(instagramUrl)}
            href={instagramUrl}
          />
        )}
        {address && (
          <ContactTile
            icon={<LocationIcon className="h-5 w-5" />}
            label="Address"
            value={address}
            className="sm:col-span-2"
          />
        )}
      </div>

      {address && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Store location map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
            className="h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}
    </div>
  );
}

function ContactTile({
  icon,
  label,
  value,
  href,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-widest text-muted">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-neutral-900">{value}</span>
      </span>
    </>
  );
  const tileClassName = `flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4 transition hover:border-neutral-400 ${className}`;

  if (!href) {
    return <div className={tileClassName}>{content}</div>;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={tileClassName}
    >
      {content}
    </a>
  );
}
