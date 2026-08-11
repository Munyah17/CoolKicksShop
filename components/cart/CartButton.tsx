"use client";

import { useCart } from "@/lib/cart/context";
import { BagIcon } from "@/components/ui/icons";

export function CartButton() {
  const { itemCount, open } = useCart();

  return (
    <button
      onClick={open}
      aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className="relative flex h-9 w-9 items-center justify-center text-neutral-900"
    >
      <BagIcon />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
          {itemCount}
        </span>
      )}
    </button>
  );
}
