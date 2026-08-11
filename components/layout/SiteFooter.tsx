import Link from "next/link";
import { siteConfig } from "@/lib/config";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Sneakers" },
      { href: "/shop?sort=newest", label: "New Arrivals" },
    ],
  },
  {
    title: "Info",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/delivery", label: "Delivery" },
      { href: "/legal/returns", label: "Returns" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-bold tracking-tight text-neutral-900">
              {siteConfig.brandName.toUpperCase()}
            </p>
            <p className="mt-2 max-w-[22ch] text-sm text-muted">{siteConfig.tagline}</p>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-neutral-700 hover:text-neutral-900"
            >
              Instagram
            </a>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-neutral-700 hover:text-neutral-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted">
          &copy; {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
