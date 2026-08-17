"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import { sortedSizes, isInStock } from "@/lib/catalogue/helpers";
import type { ProductWithDetails } from "@/types/database";

// Adds instantly, no size prompt -- size is chosen later in the cart. The
// size grid below is informational (what's in stock) rather than a
// required selection step.
export function AddToCartForm({
  product,
  imageUrl,
}: {
  product: ProductWithDetails;
  imageUrl: string | null;
}) {
  const sizes = sortedSizes(product);
  const [added, setAdded] = useState(false);
  const { addItem, open } = useCart();
  const inStock = isInStock(product);

  function handleAdd() {
    if (!inStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: "",
      availableSizes: sizes.map((s) => ({ size: s.size, stock: s.stock })),
      unitPrice: product.sale_price ?? product.price,
      quantity: 1,
      colour: product.colour,
      imageUrl,
    });
    setAdded(true);
    open();
  }

  return (
    <div>
      {sizes.length > 0 && (
        <>
          <p className="text-sm font-medium text-neutral-900">Available Sizes</p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {sizes.map((size) => (
              <div
                key={size.id}
                className={`flex h-11 items-center justify-center rounded-md border text-sm font-medium ${
                  size.stock <= 0
                    ? "border-border text-neutral-300 line-through"
                    : "border-border text-neutral-700"
                }`}
              >
                {size.size}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Size is selected in your cart, before checkout.</p>
        </>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        className="mt-6 w-full rounded-md bg-neutral-900 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {!inStock ? "Sold Out" : added ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}
