"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/admin/orderActions";
import type { OrderStatus } from "@/types/database";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "processing", label: "Processing" },
  { value: "ready_for_dispatch", label: "Ready / Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusForm({ reference, currentStatus }: { reference: string; currentStatus: string }) {
  const [value, setValue] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(newStatus: string) {
    setValue(newStatus);
    setError(null);
    startTransition(async () => {
      try {
        await updateOrderStatus(reference, newStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update status.");
        setValue(currentStatus);
      }
    });
  }

  return (
    <div>
      <select
        value={value}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="input"
      >
        {!OPTIONS.some((o) => o.value === value) && (
          <option value={value}>{value.replace(/_/g, " ")}</option>
        )}
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
