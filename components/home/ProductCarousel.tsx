"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { ProductWithDetails } from "@/types/database";

// 4 columns at a time on desktop, 1 on mobile -- arrows scroll exactly
// one product at a time, not a full page.
export function ProductCarousel({ products }: { products: ProductWithDetails[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>("[data-carousel-item]");
    const style = item ? getComputedStyle(el) : null;
    const gap = style ? parseFloat(style.columnGap || "0") : 0;
    const step = item ? item.offsetWidth + gap : el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} data-carousel-item className="w-full shrink-0 snap-start lg:w-[calc((100%-4.5rem)/4)]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="absolute left-0 top-1/2 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 shadow-sm transition hover:text-neutral-900 sm:flex"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next"
            className="absolute right-0 top-1/2 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-white text-neutral-700 shadow-sm transition hover:text-neutral-900 sm:flex"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
