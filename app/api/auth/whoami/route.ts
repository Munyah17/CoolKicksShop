import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";

// Backs the header's account icon (components/layout/AccountLink.tsx).
// Split out into its own route handler -- rather than resolved inline in
// the page render -- so that reading the auth cookie doesn't force every
// public storefront page into dynamic (uncacheable) rendering. A Route
// Handler is always request-time regardless; the pages that fetch this
// client-side stay static/ISR.
export async function GET() {
  const { user, isAdmin } = await requireAdmin();

  const href = !user ? "/account/login" : isAdmin ? "/admin" : "/account";
  const label = !user ? "Sign in" : isAdmin ? "Admin dashboard" : "Your account";

  return NextResponse.json({ href, label }, { headers: { "Cache-Control": "no-store" } });
}
