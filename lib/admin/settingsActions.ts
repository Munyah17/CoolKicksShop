"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const settingsSchema = z.object({
  logoUrl: z.union([z.literal(""), z.string().trim().url()]),
  instagramUrl: z.union([z.literal(""), z.string().trim().url()]),
  whatsappNumber: z.string().trim().max(20),
  contactEmail: z.union([z.literal(""), z.string().trim().email()]),
});

export async function updateSettings(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = settingsSchema.safeParse({
    logoUrl: formData.get("logoUrl") || "",
    instagramUrl: formData.get("instagramUrl") || "",
    whatsappNumber: formData.get("whatsappNumber") || "",
    contactEmail: formData.get("contactEmail") || "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the settings form.");

  const admin = createAdminClient();
  await admin
    .from("settings")
    .update({
      logo_url: parsed.data.logoUrl || null,
      instagram_url: parsed.data.instagramUrl || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      contact_email: parsed.data.contactEmail || null,
    })
    .eq("id", true);

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
}
