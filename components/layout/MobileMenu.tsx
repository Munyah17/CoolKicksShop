"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center text-neutral-900"
      >
        <MenuIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-neutral-900/40" />
          <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white p-6 shadow-xl">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1 text-neutral-900">
                <CloseIcon />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-neutral-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
