"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";

export interface RevenuePoint {
  label: string;
  date: string;
  amount: number;
}

// Single-series bar chart -- one hue (neutral-900) is enough, no legend
// needed. Values are shown on hover/focus rather than stamped on every
// bar, per the dataviz skill's "label selectively" rule.
export function RevenueChart({ points }: { points: RevenuePoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.amount));
  const peakIndex = points.reduce((best, p, i) => (p.amount > points[best].amount ? i : best), 0);

  return (
    <div className="border border-border bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Revenue — Last 7 Days</h2>

      <div className="mt-6 flex h-36 items-end gap-2 sm:gap-3">
        {points.map((p, i) => {
          const heightPct = Math.max(2, (p.amount / max) * 100);
          const isActive = active === i;
          const showValue = isActive || i === peakIndex;

          return (
            <div
              key={p.date}
              tabIndex={0}
              role="img"
              aria-label={`${p.label}: ${formatMoney(p.amount, siteConfig.currencySymbol)}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="relative flex flex-1 flex-col items-center justify-end gap-1.5 rounded-sm px-1 pt-6 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              {showValue && (
                <span className="pointer-events-none absolute top-0 whitespace-nowrap text-[10px] font-medium text-neutral-900">
                  {formatMoney(p.amount, siteConfig.currencySymbol)}
                </span>
              )}
              <div
                className={`w-full max-w-[28px] rounded-t transition-colors ${
                  isActive ? "bg-neutral-700" : "bg-neutral-900"
                }`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-[10px] uppercase tracking-widest text-muted">{p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
