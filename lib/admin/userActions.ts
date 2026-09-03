"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin, type AdminRole } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUserSummary {
  id: string;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  role: AdminRole;
}

// Lists accounts that currently have admin access (the `admins` table),
// not every registered customer -- this page manages staff access, not
// the customer base.
export async function listAdminUsers(): Promise<AdminUserSummary[]> {
  const { isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) throw new Error("Not authorized.");

  const admin = createAdminClient();
  const [{ data: adminRows, error: adminError }, { data: authData, error: authError }] = await Promise.all([
    admin.from("admins").select("user_id, role"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  if (adminError || authError) throw new Error("Could not load admin users.");

  const authById = new Map(authData.users.map((u) => [u.id, u]));

  return (adminRows ?? [])
    .map((row): AdminUserSummary => {
      const authUser = authById.get(row.user_id);
      return {
        id: row.user_id,
        email: authUser?.email ?? null,
        createdAt: authUser?.created_at ?? "",
        lastSignInAt: authUser?.last_sign_in_at ?? null,
        role: (row.role as AdminRole) ?? "admin",
      };
    })
    .sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
}

const createAdminUserSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["super_admin", "admin"]),
});

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createAdminUser(formData: FormData): Promise<ActionResult> {
  const { isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin) return { ok: false, error: "Not authorized." };

  const parsed = createAdminUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const admin = createAdminClient();
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (userError || !userData.user) {
    return { ok: false, error: userError?.message.includes("already") ? "An account with that email already exists." : "Could not create the account." };
  }

  const { error: adminError } = await admin
    .from("admins")
    .insert({ user_id: userData.user.id, role: parsed.data.role });
  if (adminError) {
    // Roll back the auth user so we don't leave an orphaned account with no admin row.
    await admin.auth.admin.deleteUser(userData.user.id);
    return { ok: false, error: "Could not grant admin access." };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateAdminRole(userId: string, role: AdminRole) {
  const { user, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin || !user) throw new Error("Not authorized.");
  if (userId === user.id) throw new Error("You can't change your own role.");
  if (!role) throw new Error("Invalid role.");

  const admin = createAdminClient();
  const { error } = await admin.from("admins").update({ role }).eq("user_id", userId);
  if (error) throw new Error("Could not update role.");

  revalidatePath("/admin/users");
}

// Revokes admin access (deletes the `admins` row) without touching the
// underlying auth account -- the person just goes back to being a
// regular customer, rather than losing their login entirely.
export async function removeAdminAccess(userId: string) {
  const { user, isSuperAdmin } = await requireSuperAdmin();
  if (!isSuperAdmin || !user) throw new Error("Not authorized.");
  if (userId === user.id) throw new Error("You can't remove your own admin access.");

  const admin = createAdminClient();
  const { count } = await admin.from("admins").select("user_id", { count: "exact", head: true }).eq("role", "super_admin");
  const { data: target } = await admin.from("admins").select("role").eq("user_id", userId).maybeSingle();
  if (target?.role === "super_admin" && (count ?? 0) <= 1) {
    throw new Error("Can't remove the last super admin.");
  }

  const { error } = await admin.from("admins").delete().eq("user_id", userId);
  if (error) throw new Error("Could not remove admin access.");

  revalidatePath("/admin/users");
}
