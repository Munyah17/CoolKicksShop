// Central, non-secret site configuration. Change values here rather than
// scattering brand copy/links across components.

export const siteConfig = {
  brandName: "Got The Shoe",
  legalName: "Cool Kicks",
  tagline: "Some people have good taste in life.",
  description:
    "Got The Shoe is Cool Kicks' online sneaker boutique — premium, hand-picked kicks with delivery across Zimbabwe.",
  instagramUrl: "https://www.instagram.com/coolkicksklan/",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  currency: "USD",
  currencySymbol: "$",
  orderReferencePrefix: "CK-",
} as const;

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:6100";
  return `${base.replace(/\/$/, "")}${path}`;
}

export function whatsappLink(message?: string, numberOverride?: string) {
  const number = numberOverride || siteConfig.whatsappNumber;
  if (!number) return siteConfig.instagramUrl;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}
