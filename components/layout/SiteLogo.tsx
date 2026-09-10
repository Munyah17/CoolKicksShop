import Link from "next/link";
import { getSiteSettings } from "@/lib/catalogue/queries";
import { siteConfig } from "@/lib/config";

// Falls back to a plain monogram mark until a real logo is uploaded via
// /admin/settings -- never the brand wordmark (removed per brand request).
export async function SiteLogo() {
  const settings = await getSiteSettings();
  const logoUrl = settings?.logo_url;

  return (
    <Link href="/" aria-label={`${siteConfig.brandName} — Home`} className="flex shrink-0 items-center">
      {logoUrl ? (
        // Plain <img>, not next/image: the logo URL can point at any host the
        // admin uploaded to, which next/image would reject unless whitelisted.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={siteConfig.brandName}
          width={120}
          height={36}
          className="h-9 w-auto object-contain"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm font-bold text-neutral-900">
          {siteConfig.brandName.charAt(0)}
        </span>
      )}
    </Link>
  );
}
