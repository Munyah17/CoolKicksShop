"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";
import type { OrderSummary } from "@/lib/orders/getOrderSummary";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~1 minute

export function OrderStatus({ initial, shouldPoll }: { initial: OrderSummary; shouldPoll: boolean }) {
  const [paymentStatus, setPaymentStatus] = useState(initial.paymentStatus);
  const [orderStatus, setOrderStatus] = useState(initial.orderStatus);
  const [polling, setPolling] = useState(shouldPoll);
  const [gaveUp, setGaveUp] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (!polling) return;

    let cancelled = false;

    async function poll() {
      attempts.current += 1;
      try {
        const res = await fetch(`/api/paynow/status?reference=${encodeURIComponent(initial.reference)}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.paymentStatus && data.paymentStatus !== "pending") {
          setPaymentStatus(data.paymentStatus);
          setOrderStatus(data.orderStatus);
          setPolling(false);
          return;
        }
      } catch {
        // Ignore transient network errors and keep polling.
      }

      if (attempts.current >= MAX_POLLS) {
        setPolling(false);
        setGaveUp(true);
        return;
      }

      timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    }

    let timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [polling, initial.reference]);

  async function retryPayment() {
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch("/api/paynow/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: initial.reference }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRetryError(data.error ?? "Could not restart payment.");
        setRetrying(false);
        return;
      }
      window.location.assign(data.redirectUrl);
    } catch {
      setRetryError("Network error. Please try again.");
      setRetrying(false);
    }
  }

  if (paymentStatus === "pending") {
    return (
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-neutral-300" aria-hidden="true" />
        <h1 className="mt-6 text-xl font-semibold text-neutral-900">Checking payment…</h1>
        <p className="mt-2 text-sm text-muted">
          We&apos;re confirming your payment with Paynow. This usually takes a few seconds.
        </p>
        {gaveUp && (
          <p className="mt-4 text-sm text-muted">
            Still waiting on confirmation. If you completed payment, this page will update
            automatically once we hear back — you can also{" "}
            <button onClick={() => window.location.reload()} className="underline underline-offset-2">
              refresh
            </button>
            .
          </p>
        )}
        <Link href={`/order/${initial.reference}`} className="mt-6 inline-block text-sm text-muted underline underline-offset-4">
          Order reference: {initial.reference}
        </Link>
      </div>
    );
  }

  if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    return (
      <div className="text-center">
        <XCircleIcon className="mx-auto h-10 w-10 text-neutral-400" />
        <h1 className="mt-6 text-xl font-semibold text-neutral-900">Payment unsuccessful</h1>
        <p className="mt-2 text-sm text-muted">Your order has not been confirmed. No charge was made.</p>
        {retryError && <p className="mt-3 text-sm text-red-600">{retryError}</p>}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={retryPayment}
            disabled={retrying}
            className="w-full max-w-xs bg-neutral-900 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {retrying ? "Redirecting…" : "Try Payment Again"}
          </button>
          <Link href="/shop" className="text-sm text-muted underline underline-offset-4">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  // paid / processing / delivered etc. -- confirmed.
  return (
    <div>
      <div className="text-center">
        <CheckCircleIcon className="mx-auto h-10 w-10 text-neutral-900" />
        <h1 className="mt-6 text-xl font-semibold text-neutral-900">Payment Successful</h1>
        <p className="mt-1 text-sm text-muted">Order #{initial.reference}</p>
        <p className="mt-4 text-sm text-neutral-700">
          Thank you for shopping with {siteConfig.legalName}. Your order has been confirmed.
        </p>
      </div>

      <div className="mt-10 border border-border p-5">
        <ul className="space-y-3">
          {initial.items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-neutral-700">
                {item.productName} <span className="text-muted">(UK {item.size})</span> &times; {item.quantity}
              </span>
              <span className="font-medium text-neutral-900">
                {formatMoney(item.lineTotal, siteConfig.currencySymbol)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Delivery</span>
            <span>
              {initial.deliveryMethod === "pickup" ? "Store pickup" : initial.city ?? "Delivery"}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span>{formatMoney(initial.total, siteConfig.currencySymbol)}</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">Order status: {formatOrderStatus(orderStatus)}</p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className="text-sm font-medium text-neutral-900 underline underline-offset-4">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function formatOrderStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
