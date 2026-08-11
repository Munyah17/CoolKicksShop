import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { CartButton } from "@/components/cart/CartButton";
import { SearchIcon } from "@/components/ui/icons";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
          {siteConfig.brandName.toUpperCase()}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/shop"
            aria-label="Search products"
            className="hidden h-9 w-9 items-center justify-center text-neutral-900 sm:flex"
          >
            <SearchIcon />
          </Link>
          <CartButton />
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}
