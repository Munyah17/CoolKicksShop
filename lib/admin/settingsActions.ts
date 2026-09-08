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
  address: z.string().trim().max(300),
  phone: z.string().trim().max(30),
  tagline: z.string().trim().max(200),
  homepageBlurbHeading: z.string().trim().max(200),
  homepageBlurbBody: z.string().trim().max(600),
  aboutContent: z.string().trim().max(4000),
});

export async function updateSettings(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = settingsSchema.safeParse({
    logoUrl: formData.get("logoUrl") || "",
    instagramUrl: formData.get("instagramUrl") || "",
    whatsappNumber: formData.get("whatsappNumber") || "",
    contactEmail: formData.get("contactEmail") || "",
    address: formData.get("address") || "",
    phone: formData.get("phone") || "",
    tagline: formData.get("tagline") || "",
    homepageBlurbHeading: formData.get("homepageBlurbHeading") || "",
    homepageBlurbBody: formData.get("homepageBlurbBody") || "",
    aboutContent: formData.get("aboutContent") || "",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the settings form.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("settings")
    .update({
      logo_url: parsed.data.logoUrl || null,
      instagram_url: parsed.data.instagramUrl || null,
      whatsapp_number: parsed.data.whatsappNumber || null,
      contact_email: parsed.data.contactEmail || null,
      address: parsed.data.address || null,
      phone: parsed.data.phone || null,
      tagline: parsed.data.tagline || null,
      homepage_blurb_heading: parsed.data.homepageBlurbHeading || null,
      homepage_blurb_body: parsed.data.homepageBlurbBody || null,
      about_content: parsed.data.aboutContent || null,
    })
    .eq("id", true);
  if (error) throw new Error("Could not save settings. Please try again.");

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/about");
}

export interface UploadLogoImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function uploadLogoImage(formData: FormData): Promise<UploadLogoImageResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are allowed." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `logo-${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage.from("logo-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { ok: false, error: "Upload failed. Please try again." };
  }

  const { data } = admin.storage.from("logo-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
