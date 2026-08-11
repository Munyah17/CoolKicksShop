"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { productFormSchema } from "@/lib/validation/product";
import type { ProductSizeRow } from "@/types/database";

export interface SaveProductResult {
  ok: boolean;
  error?: string;
  productId?: string;
}

export async function saveProduct(formData: FormData): Promise<SaveProductResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false, error: "Not authorized." };

  let sizes: unknown;
  let images: unknown;
  try {
    sizes = JSON.parse((formData.get("sizesJson") as string) || "[]");
    images = JSON.parse((formData.get("imagesJson") as string) || "[]");
  } catch {
    return { ok: false, error: "Invalid sizes/images data." };
  }

  const parsed = productFormSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    category: formData.get("category") || "sneakers",
    brand: formData.get("brand") || undefined,
    colour: formData.get("colour") || undefined,
    price: formData.get("price"),
    salePrice: formData.get("salePrice") || undefined,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    sizes,
    images,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  const productPayload = {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    short_description: data.shortDescription || null,
    category: data.category,
    brand: data.brand || null,
    colour: data.colour || null,
    price: data.price,
    sale_price: data.salePrice ?? null,
    featured: data.featured ?? false,
    active: data.active ?? true,
  };

  let productId = data.id;

  if (productId) {
    const { error } = await admin.from("products").update(productPayload).eq("id", productId);
    if (error) return { ok: false, error: error.message.includes("slug") ? "That URL slug is already in use." : "Could not save product." };
  } else {
    const { data: inserted, error } = await admin
      .from("products")
      .insert(productPayload)
      .select("id")
      .single<{ id: string }>();
    if (error || !inserted) {
      return { ok: false, error: error?.message.includes("slug") ? "That URL slug is already in use." : "Could not save product." };
    }
    productId = inserted.id;
  }

  await syncSizes(productId, data.sizes);
  await syncImages(productId, data.images);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/");

  return { ok: true, productId };
}

async function syncSizes(productId: string, sizes: { size: string; stock: number }[]) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("product_sizes")
    .select("*")
    .eq("product_id", productId)
    .returns<ProductSizeRow[]>();

  const submittedSizeValues = new Set(sizes.map((s) => s.size));
  const toDelete = (existing ?? []).filter((row) => !submittedSizeValues.has(row.size));

  if (toDelete.length > 0) {
    await admin.from("product_sizes").delete().in("id", toDelete.map((r) => r.id));
  }

  if (sizes.length > 0) {
    await admin.from("product_sizes").upsert(
      sizes.map((s) => ({ product_id: productId, size: s.size, stock: s.stock })),
      { onConflict: "product_id,size" }
    );
  }
}

async function syncImages(
  productId: string,
  images: { url: string; alt?: string; isPrimary?: boolean }[]
) {
  const admin = createAdminClient();

  await admin.from("product_images").delete().eq("product_id", productId);

  if (images.length === 0) return;

  const hasPrimary = images.some((img) => img.isPrimary);
  await admin.from("product_images").insert(
    images.map((img, index) => ({
      product_id: productId,
      url: img.url,
      alt: img.alt || null,
      display_order: index,
      is_primary: hasPrimary ? Boolean(img.isPrimary) : index === 0,
    }))
  );
}

export async function setProductActive(id: string, active: boolean) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const admin = createAdminClient();
  await admin.from("products").update({ active }).eq("id", id);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
