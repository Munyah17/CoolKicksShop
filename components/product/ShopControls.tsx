"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "@/components/ui/icons";

const sortLabels: Record<string, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

export function ShopControls({ sort, query }: { sort: string; query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(query);

  function updateParams(next: { sort?: string; q?: string }) {
    const params = new URLSearchParams();
    const nextSort = next.sort ?? sort;
    const nextQ = next.q ?? q;
    if (nextSort && nextSort !== "featured") params.set("sort", nextSort);
    if (nextQ) params.set("q", nextQ);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParams({ q });
        }}
        className="relative w-full sm:max-w-xs"
      >
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sneakers…"
          aria-label="Search sneakers"
          className="w-full border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-400"
        />
      </form>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted">Sort</span>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="border border-border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
        >
          {Object.entries(sortLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
