import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { UserIcon } from "@/components/ui/icons";

// Admins sign in through the same Supabase Auth session as customers --
// route them straight to /admin instead of the customer /account page,
// which they'd otherwise never see a link to from here.
export async function AccountLink() {
  const { user, isAdmin } = await requireAdmin();

  const href = !user ? "/account/login" : isAdmin ? "/admin" : "/account";
  const label = !user ? "Sign in" : isAdmin ? "Admin dashboard" : "Your account";

  return (
    <Link href={href} aria-label={label} className="flex h-9 w-9 items-center justify-center text-neutral-900">
      <UserIcon />
    </Link>
  );
}
