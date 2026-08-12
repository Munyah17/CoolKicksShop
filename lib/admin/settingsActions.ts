"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const settingsSchema = z.object({
  logoUrl: z.union([z.literal(""), z.string().trim().url()]),
});

export async function updateSettings(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = settingsSchema.safeParse({ logoUrl: formData.get("logoUrl") || "" });
  if (!parsed.success) throw new Error("Please enter a valid logo URL.");

  const admin = createAdminClient();
  await admin.from("settings").update({ logo_url: parsed.data.logoUrl || null }).eq("id", true);

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
