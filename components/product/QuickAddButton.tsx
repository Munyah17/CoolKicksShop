"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import { sortedSizes } from "@/lib/catalogue/helpers";
import type { ProductWithDetails } from "@/types/database";

export function QuickAddButton({
  product,
  imageUrl,
}: {
  product: ProductWithDetails;
  imageUrl: string | null;
}) {
  const { addItem } = useCart();
  const [pickingSize, setPickingSize] = useState(false);

  const availableSizes = sortedSizes(product).filter((s) => s.stock > 0);
  const unitPrice = product.sale_price ?? product.price;

  function add(size: string) {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      unitPrice,
      quantity: 1,
      colour: product.colour,
      imageUrl,
    });
    setPickingSize(false);
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (availableSizes.length === 0) return;
    if (availableSizes.length === 1) {
      add(availableSizes[0].size);
      return;
    }
    setPickingSize((v) => !v);
  }

  if (availableSizes.length === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-2 w-full cursor-not-allowed rounded-md border border-border py-2 text-xs font-semibold uppercase tracking-widest text-neutral-300"
      >
        Sold Out
      </button>
    );
  }

  if (pickingSize) {
    return (
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => add(s.size)}
              className="h-8 min-w-8 rounded border border-border px-1.5 text-xs font-medium text-neutral-900 transition hover:border-neutral-900"
            >
              {s.size}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 w-full rounded-md bg-neutral-900 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700"
    >
      Add to Cart
    </button>
  );
}
