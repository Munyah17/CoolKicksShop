import { createClient } from "@/lib/supabase/server";
import type {
  DeliveryOptionRow,
  ProductImageRow,
  ProductRow,
  ProductSizeRow,
  ProductWithDetails,
} from "@/types/database";

// Public catalogue reads. These go through the RLS-respecting client --
// there is no need for the service role here, the "active products only"
// policy already does the filtering.

export async function getFeaturedProducts(limit = 4): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ProductWithDetails[]>();
  return data ?? [];
}

export async function getNewArrivals(limit = 4): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ProductWithDetails[]>();
  return data ?? [];
}

export async function getAllActiveProducts(): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .returns<ProductWithDetails[]>();
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle<ProductWithDetails>();
  return data;
}

export async function getRelatedProducts(
  product: ProductRow,
  limit = 4
): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("active", true)
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(limit)
    .returns<ProductWithDetails[]>();
  return data ?? [];
}

export async function getActiveDeliveryOptions(): Promise<DeliveryOptionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("delivery_options")
    .select("*")
    .eq("active", true)
    .order("sort_order")
    .returns<DeliveryOptionRow[]>();
  return data ?? [];
}

export function primaryImage(product: { product_images: ProductImageRow[] }): ProductImageRow | null {
  if (!product.product_images.length) return null;
  return (
    product.product_images.find((img) => img.is_primary) ??
    [...product.product_images].sort((a, b) => a.display_order - b.display_order)[0]
  );
}

export function sortedSizes(product: { product_sizes: ProductSizeRow[] }): ProductSizeRow[] {
  return [...product.product_sizes].sort((a, b) => {
    const na = parseFloat(a.size);
    const nb = parseFloat(b.size);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.size.localeCompare(b.size);
  });
}

export function isInStock(product: { product_sizes: ProductSizeRow[] }): boolean {
  return product.product_sizes.some((s) => s.stock > 0);
}
