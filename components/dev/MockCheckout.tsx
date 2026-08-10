"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MockCheckout({ reference, amount }: { reference: string; amount: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function simulate(outcome: "paid" | "cancelled" | "failed") {
    setPending(outcome);
    await fetch("/api/dev/paynow-simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, outcome }),
    });
    router.push(`/order/${reference}?check=1`);
  }

  return (
    <div className="w-full max-w-sm rounded border border-neutral-300 bg-white p-8 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-amber-600">Development only</p>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900">Simulated Paynow Checkout</h1>
      <p className="mt-1 text-sm text-neutral-500">
        No real Paynow credentials are configured. This screen stands in for Paynow&apos;s hosted
        checkout so you can exercise the full order flow locally.
      </p>

      <dl className="mt-6 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Order reference</dt>
          <dd className="font-medium text-neutral-900">{reference}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Amount</dt>
          <dd className="font-medium text-neutral-900">${amount}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={() => simulate("paid")}
          disabled={pending !== null}
          className="w-full rounded bg-neutral-900 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending === "paid" ? "Processing…" : "Simulate Successful Payment"}
        </button>
        <button
          onClick={() => simulate("failed")}
          disabled={pending !== null}
          className="w-full rounded border border-neutral-300 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {pending === "failed" ? "Processing…" : "Simulate Failed Payment"}
        </button>
        <button
          onClick={() => simulate("cancelled")}
          disabled={pending !== null}
          className="w-full rounded border border-neutral-300 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {pending === "cancelled" ? "Processing…" : "Simulate Cancelled Payment"}
        </button>
      </div>
    </div>
  );
}
