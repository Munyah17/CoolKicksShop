import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProductWithDetails } from "@/types/database";

export async function listAllProducts(): Promise<ProductWithDetails[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .order("created_at", { ascending: false })
    .returns<ProductWithDetails[]>();
  return data ?? [];
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("*, product_images(*), product_sizes(*)")
    .eq("id", id)
    .maybeSingle<ProductWithDetails>();
  return data;
}
