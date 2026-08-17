"use client";

import { useCart } from "@/lib/cart/context";
import type { CartItem } from "@/lib/cart/types";

export function SizeSelect({ item, className = "" }: { item: CartItem; className?: string }) {
  const { chooseSize } = useCart();

  return (
    <select
      required
      value={item.size}
      onChange={(e) => chooseSize(item.productId, item.size, e.target.value)}
      aria-label={`Size for ${item.name}`}
      className={`border bg-white px-2 py-1 text-xs outline-none ${
        item.size ? "border-border" : "border-neutral-900"
      } ${className}`}
    >
      <option value="" disabled>
        Select size
      </option>
      {item.availableSizes.map((s) => (
        <option key={s.size} value={s.size} disabled={s.stock <= 0}>
          {s.size}
          {s.stock <= 0 ? " (Sold out)" : ""}
        </option>
      ))}
    </select>
  );
}
