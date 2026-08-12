import { createClient } from "@/lib/supabase/server";
import type {
  DeliveryOptionRow,
  HeroSlideRow,
  ProductRow,
  ProductWithDetails,
  SettingsRow,
} from "@/types/database";

export { primaryImage, sortedSizes, isInStock } from "./helpers";

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

export interface CategorySummary {
  category: string;
  count: number;
}

// Categories are free-text on the product row (see types/database.ts), so
// "top categories" is computed here rather than via a lookup table.
export async function getTopCategories(limit = 2): Promise<CategorySummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("active", true)
    .returns<{ category: string }[]>();

  const counts = new Map<string, number>();
  for (const { category } of data ?? []) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category))
    .slice(0, limit);
}

export async function getAllCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("active", true)
    .returns<{ category: string }[]>();
  return [...new Set((data ?? []).map((row) => row.category))].sort();
}

export async function getProductsByCategory(
  category: string,
  limit = 4
): Promise<ProductWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("active", true)
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ProductWithDetails[]>();
  return data ?? [];
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

export async function getSiteSettings(): Promise<SettingsRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").eq("id", true).maybeSingle<SettingsRow>();
  return data;
}

export async function getActiveHeroSlides(): Promise<HeroSlideRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("active", true)
    .order("display_order")
    .returns<HeroSlideRow[]>();
  return data ?? [];
}
