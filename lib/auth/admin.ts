import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminRole = "super_admin" | "admin" | null;

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
    return { user: null, isAdmin: false as const, role: null as AdminRole };
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("admins")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    isAdmin: Boolean(data),
    role: (data?.role as AdminRole) ?? null,
  };
}

// Super admins can create/manage other admin accounts; regular admins
// cannot -- gates /admin/users and the actions behind it.
export async function requireSuperAdmin() {
  const { user, role } = await requireAdmin();

  if (!user || role !== "super_admin") {
    return { user, isSuperAdmin: false as const, role };
  }

  return { user, isSuperAdmin: true as const, role };
}
