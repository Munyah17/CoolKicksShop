"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/context";
import { sortedSizes } from "@/lib/catalogue/helpers";
import type { ProductWithDetails } from "@/types/database";

export function AddToCartForm({
  product,
  imageUrl,
}: {
  product: ProductWithDetails;
  imageUrl: string | null;
}) {
  const sizes = sortedSizes(product);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem, open } = useCart();

  const unitPrice = product.sale_price ?? product.price;
  const selected = sizes.find((s) => s.size === selectedSize);
  const canAdd = Boolean(selected && selected.stock > 0);

  function handleAdd() {
    if (!selected || selected.stock <= 0) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      unitPrice,
      quantity: 1,
      colour: product.colour,
      imageUrl,
    });
    setAdded(true);
    open();
  }

  return (
    <div>
      <p className="text-sm font-medium text-neutral-900">
        Size{selected ? ` — UK ${selected.size}` : ""}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {sizes.map((size) => {
          const disabled = size.stock <= 0;
          const isSelected = selectedSize === size.size;
          return (
            <button
              key={size.id}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => {
                setSelectedSize(size.size);
                setAdded(false);
              }}
              className={`h-11 rounded-md border text-sm font-medium transition ${
                disabled
                  ? "cursor-not-allowed border-border text-neutral-300 line-through"
                  : isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-border text-neutral-900 hover:border-neutral-500"
              }`}
            >
              {size.size}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        className="mt-6 w-full rounded-md bg-neutral-900 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {added ? "Added ✓" : selectedSize ? "Add to Cart" : "Select a Size"}
      </button>
    </div>
  );
}
