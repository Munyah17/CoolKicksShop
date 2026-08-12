"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const heroSlideSchema = z.object({
  imageUrl: z.string().trim().url(),
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
  await admin.from("hero_slides").insert({
    image_url: parsed.data.imageUrl,
    headline: parsed.data.headline || null,
    subheadline: parsed.data.subheadline || null,
    cta_label: parsed.data.ctaLabel || null,
    cta_href: parsed.data.ctaHref || null,
    display_order: parsed.data.displayOrder,
    active: parsed.data.active,
  });

  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}

export async function updateHeroSlide(id: string, formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = parseForm(formData);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid slide.");

  const admin = createAdminClient();
  await admin
    .from("hero_slides")
    .update({
      image_url: parsed.data.imageUrl,
      headline: parsed.data.headline || null,
      subheadline: parsed.data.subheadline || null,
      cta_label: parsed.data.ctaLabel || null,
      cta_href: parsed.data.ctaHref || null,
      display_order: parsed.data.displayOrder,
      active: parsed.data.active,
    })
    .eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}

export async function deleteHeroSlide(id: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const admin = createAdminClient();
  await admin.from("hero_slides").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/hero-slides");
}
