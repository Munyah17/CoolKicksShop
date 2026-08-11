import type { Metadata } from "next";
import { getAllActiveProducts } from "@/lib/catalogue/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopControls } from "@/components/product/ShopControls";
import type { ProductWithDetails } from "@/types/database";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full sneaker selection.",
};

type SortOption = "newest" | "price-asc" | "price-desc" | "featured";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort: rawSort, q } = await searchParams;
  const sort: SortOption = isSortOption(rawSort) ? rawSort : "featured";

  const products = await getAllActiveProducts();
  const filtered = filterAndSort(products, q, sort);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Shop</h1>
        <p className="text-sm text-muted">{filtered.length} pair{filtered.length === 1 ? "" : "s"}</p>
      </div>

      <ShopControls sort={sort} query={q ?? ""} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-muted">No kicks found.</p>
          <a href="/shop" className="text-sm font-medium text-neutral-900 underline underline-offset-4">
            Clear filters
          </a>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function isSortOption(value: string | undefined): value is SortOption {
  return value === "newest" || value === "price-asc" || value === "price-desc" || value === "featured";
}

function filterAndSort(products: ProductWithDetails[], q: string | undefined, sort: SortOption) {
  let result = products;

  if (q) {
    const needle = q.trim().toLowerCase();
    if (needle) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.brand ?? "").toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle)
      );
    }
  }

  const sorted = [...result];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
    case "price-asc":
      sorted.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
      break;
    case "price-desc":
      sorted.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
      break;
    case "featured":
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }
  return sorted;
}
