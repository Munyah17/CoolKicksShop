import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  DeliveryOptionRow,
  HeroSlideRow,
  ProductRow,
  ProductWithDetails,
  SettingsRow,
} from "@/types/database";

export { primaryImage, sortedSizes, isInStock } from "./helpers";

// Public catalogue reads. These go through a cookie-free anon client -- there
// is no need for the service role or a per-visitor session here, the "active
// products only" RLS policy already does the filtering the same way for
// everyone.
//
// Every query below is wrapped in unstable_cache so a burst of visitors
// shares one Supabase round trip instead of each triggering their own; admin
// mutations call revalidateTag (see lib/admin/*Actions.ts) to bust this
// immediately, and `revalidate` below is just the safety-net TTL in case a
// tag is ever missed.
const REVALIDATE_SECONDS = 60;

export async function getFeaturedProducts(limit = 4): Promise<ProductWithDetails[]> {
  return unstable_cache(
    async (limit: number) => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_sizes(*)")
        .eq("active", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<ProductWithDetails[]>();
      return data ?? [];
    },
    ["catalogue-featured-products"],
    { tags: ["products"], revalidate: REVALIDATE_SECONDS }
  )(limit);
}

export async function getNewArrivals(limit = 4): Promise<ProductWithDetails[]> {
  return unstable_cache(
    async (limit: number) => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_sizes(*)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<ProductWithDetails[]>();
      return data ?? [];
    },
    ["catalogue-new-arrivals"],
    { tags: ["products"], revalidate: REVALIDATE_SECONDS }
  )(limit);
}

export const getAllActiveProducts = unstable_cache(
  async (): Promise<ProductWithDetails[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*, product_images(*), product_sizes(*)")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .returns<ProductWithDetails[]>();
    return data ?? [];
  },
  ["catalogue-all-active-products"],
  { tags: ["products"], revalidate: REVALIDATE_SECONDS }
);

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  return unstable_cache(
    async (slug: string) => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_sizes(*)")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle<ProductWithDetails>();
      return data;
    },
    ["catalogue-product-by-slug"],
    { tags: ["products"], revalidate: REVALIDATE_SECONDS }
  )(slug);
}

export interface CategorySummary {
  category: string;
  count: number;
}

// Categories are free-text on the product row (see types/database.ts), so
// "top categories" is computed here rather than via a lookup table.
export const getTopCategories = unstable_cache(
  async (limit = 2): Promise<CategorySummary[]> => {
    const supabase = createPublicClient();
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
  },
  ["catalogue-top-categories"],
  { tags: ["products"], revalidate: REVALIDATE_SECONDS }
);

export const getAllCategories = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("category")
      .eq("active", true)
      .returns<{ category: string }[]>();
    return [...new Set((data ?? []).map((row) => row.category))].sort();
  },
  ["catalogue-all-categories"],
  { tags: ["products"], revalidate: REVALIDATE_SECONDS }
);

export async function getProductsByCategory(
  category: string,
  limit = 4
): Promise<ProductWithDetails[]> {
  return unstable_cache(
    async (category: string, limit: number) => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_sizes(*)")
        .eq("active", true)
        .eq("category", category)
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<ProductWithDetails[]>();
      return data ?? [];
    },
    ["catalogue-products-by-category"],
    { tags: ["products"], revalidate: REVALIDATE_SECONDS }
  )(category, limit);
}

export async function getRelatedProducts(
  product: ProductRow,
  limit = 4
): Promise<ProductWithDetails[]> {
  return unstable_cache(
    async (category: string, excludeId: string, limit: number) => {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("products")
        .select("*, product_images(*), product_sizes(*)")
        .eq("active", true)
        .eq("category", category)
        .neq("id", excludeId)
        .limit(limit)
        .returns<ProductWithDetails[]>();
      return data ?? [];
    },
    ["catalogue-related-products"],
    { tags: ["products"], revalidate: REVALIDATE_SECONDS }
  )(product.category, product.id, limit);
}

export const getActiveDeliveryOptions = unstable_cache(
  async (): Promise<DeliveryOptionRow[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("delivery_options")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .returns<DeliveryOptionRow[]>();
    return data ?? [];
  },
  ["catalogue-delivery-options"],
  { tags: ["delivery-options"], revalidate: REVALIDATE_SECONDS }
);

export const getSiteSettings = unstable_cache(
  async (): Promise<SettingsRow | null> => {
    const supabase = createPublicClient();
    const { data } = await supabase.from("settings").select("*").eq("id", true).maybeSingle<SettingsRow>();
    return data;
  },
  ["catalogue-site-settings"],
  { tags: ["settings"], revalidate: REVALIDATE_SECONDS }
);

export const getActiveHeroSlides = unstable_cache(
  async (): Promise<HeroSlideRow[]> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("active", true)
      .order("display_order")
      .returns<HeroSlideRow[]>();
    return data ?? [];
  },
  ["catalogue-hero-slides"],
  { tags: ["hero-slides"], revalidate: REVALIDATE_SECONDS }
);
