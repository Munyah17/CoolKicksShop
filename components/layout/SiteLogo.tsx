import Link from "next/link";
import Image from "next/image";
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
        <Image
          src={logoUrl}
          alt={siteConfig.brandName}
          width={120}
          height={36}
          priority
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
