"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import { sortedSizes, isInStock } from "@/lib/catalogue/helpers";
import type { ProductWithDetails } from "@/types/database";

// Adds instantly, no size prompt -- size is chosen later in the cart.
export function QuickAddButton({
  product,
  imageUrl,
}: {
  product: ProductWithDetails;
  imageUrl: string | null;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const inStock = isInStock(product);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: "",
      availableSizes: sortedSizes(product).map((s) => ({ size: s.size, stock: s.stock })),
      unitPrice: product.sale_price ?? product.price,
      quantity: 1,
      colour: product.colour,
      imageUrl,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={handleClick}
      className="mt-2 w-full rounded-md bg-neutral-900 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {!inStock ? "Sold Out" : added ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
