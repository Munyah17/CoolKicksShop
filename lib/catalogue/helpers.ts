// Pure helpers with no Supabase/next-headers dependency, safe to import
// from both Server and Client Components. lib/catalogue/queries.ts (which
// pulls in the server-only Supabase client) re-exports these for
// convenience in server code, but client code should import this file
// directly.
import type { ProductImageRow, ProductSizeRow } from "@/types/database";

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
