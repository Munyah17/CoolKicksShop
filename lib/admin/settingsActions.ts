"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const LOGO_BUCKET = "logo-images";

type AdminClient = ReturnType<typeof createAdminClient>;

async function getCurrentLogoUrl(admin: AdminClient): Promise<string | null> {
  const { data } = await admin.from("settings").select("logo_url").eq("id", true).maybeSingle<{ logo_url: string | null }>();
  return data?.logo_url ?? null;
}

// Best-effort: if the URL points at a file we uploaded to our own storage
// bucket, delete that file. URLs from anywhere else (e.g. an old Cloudinary
// upload, or a hand-pasted link) are left alone -- there is nothing of ours
// to remove.
async function deleteLogoStorageObject(admin: AdminClient, url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${LOGO_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  if (!path) return;
  await admin.storage.from(LOGO_BUCKET).remove([path]);
}

function revalidateLogoSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  revalidatePath("/about");
}

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

  // If the logo changed, clean up the file the old URL pointed at (best effort).
  const currentLogo = await getCurrentLogoUrl(admin);
  const nextLogo = parsed.data.logoUrl || null;
  if (currentLogo && currentLogo !== nextLogo) {
    await deleteLogoStorageObject(admin, currentLogo);
  }

  const { error } = await admin
    .from("settings")
    .update({
      logo_url: nextLogo,
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

  revalidateLogoSurfaces();
}

export interface UploadLogoImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export interface RemoveLogoImageResult {
  ok: boolean;
  error?: string;
}

// Clears the logo immediately (both the stored file and settings.logo_url),
// independent of the main Save button. The header falls back to the monogram.
export async function removeLogoImage(): Promise<RemoveLogoImageResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };

  const admin = createAdminClient();
  const current = await getCurrentLogoUrl(admin);
  if (current) await deleteLogoStorageObject(admin, current);

  const { error } = await admin.from("settings").update({ logo_url: null }).eq("id", true);
  if (error) return { ok: false, error: "Could not remove the logo. Please try again." };

  revalidateLogoSurfaces();
  return { ok: true };
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
  const MAX_SIZE = 150 * 1024 * 1024; // 150MB
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "File size exceeds 150MB limit." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `logo-${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage.from("logo-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { ok: false, error: `Upload failed: ${error.message}` };
  }

  const { data } = admin.storage.from("logo-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
