"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const heroSlideSchema = z.object({
  imageUrl: z.union([z.literal(""), z.string().trim().url()]),
  headline: z.string().trim().max(120).optional(),
  subheadline: z.string().trim().max(200).optional(),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaHref: z.string().trim().max(300).optional(),
  displayOrder: z.coerce.number().int().default(0),
  active: z.boolean(),
});

function parseForm(formData: FormData) {
  return heroSlideSchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    headline: formData.get("headline") || undefined,
    subheadline: formData.get("subheadline") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    ctaHref: formData.get("ctaHref") || undefined,
    displayOrder: formData.get("displayOrder") || 0,
    active: formData.get("active") === "on",
  });
}

export async function createHeroSlide(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = parseForm(formData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid slide.");

  const admin = createAdminClient();
  const { error } = await admin.from("hero_slides").insert({
    image_url: parsed.data.imageUrl || null,
    headline: parsed.data.headline || null,
    subheadline: parsed.data.subheadline || null,
    cta_label: parsed.data.ctaLabel || null,
    cta_href: parsed.data.ctaHref || null,
    display_order: parsed.data.displayOrder,
    active: parsed.data.active,
  });
  if (error) throw new Error("Could not create slide. Please try again.");

  updateTag("hero-slides");
  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}

export async function updateHeroSlide(id: string, formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = parseForm(formData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid slide.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("hero_slides")
    .update({
      image_url: parsed.data.imageUrl || null,
      headline: parsed.data.headline || null,
      subheadline: parsed.data.subheadline || null,
      cta_label: parsed.data.ctaLabel || null,
      cta_href: parsed.data.ctaHref || null,
      display_order: parsed.data.displayOrder,
      active: parsed.data.active,
    })
    .eq("id", id);
  if (error) throw new Error("Could not save slide. Please try again.");

  updateTag("hero-slides");
  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}

export async function deleteHeroSlide(id: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const admin = createAdminClient();
  const { error } = await admin.from("hero_slides").delete().eq("id", id);
  if (error) throw new Error("Could not delete slide. Please try again.");

  updateTag("hero-slides");
  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}

export interface UploadHeroSlideImageResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function uploadHeroSlideImage(formData: FormData): Promise<UploadHeroSlideImageResult> {
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
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `hero-${crypto.randomUUID()}.${ext}`;

  const { error } = await admin.storage.from("hero-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { ok: false, error: `Upload failed: ${error.message}` };
  }

  const { data } = admin.storage.from("hero-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
