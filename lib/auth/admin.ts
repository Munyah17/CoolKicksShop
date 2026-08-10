import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin status is never trusted from the client. Every admin page/route
// calls this: it reads the caller's session cookie (RLS-respecting
// client), then checks server-side (service role, bypassing RLS) whether
// that user id is present in the `admins` table.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false as const };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, isAdmin: Boolean(data) };
}
