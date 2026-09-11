"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon } from "@/components/ui/icons";

interface AccountLinkState {
  href: string;
  label: string;
}

// Correct for the overwhelming majority of page views (a signed-out guest)
// on first paint, so there's no loading flicker for the common case. A
// signed-in customer or admin gets swapped to the right destination a beat
// after mount, once /api/auth/whoami resolves -- see that route for why
// this isn't resolved server-side here anymore.
const SIGNED_OUT: AccountLinkState = { href: "/account/login", label: "Sign in" };

export function AccountLink() {
  const [state, setState] = useState<AccountLinkState>(SIGNED_OUT);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/whoami", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<AccountLinkState>) : null))
      .then((data) => {
        if (!cancelled && data) setState(data);
      })
      .catch(() => {
        // Network hiccup: leave the sign-in link, which is always safe.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link href={state.href} aria-label={state.label} className="flex h-9 w-9 items-center justify-center text-neutral-900">
      <UserIcon />
    </Link>
  );
}
