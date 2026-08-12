import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserIcon } from "@/components/ui/icons";

export async function AccountLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Link
      href={user ? "/account" : "/account/login"}
      aria-label={user ? "Your account" : "Sign in"}
      className="flex h-9 w-9 items-center justify-center text-neutral-900"
    >
      <UserIcon />
    </Link>
  );
}
