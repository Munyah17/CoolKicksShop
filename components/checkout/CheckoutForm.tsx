"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/context";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import type { DeliveryOptionRow } from "@/types/database";

type DeliveryMethod = "delivery" | "pickup";

export function CheckoutForm({ deliveryOptions }: { deliveryOptions: DeliveryOptionRow[] }) {
  const { items, subtotal, clear } = useCart();

  const deliveryAreas = deliveryOptions.filter((o) => o.type === "delivery");
  const pickupOption = deliveryOptions.find((o) => o.type === "pickup");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    deliveryAreas.length > 0 ? "delivery" : "pickup"
  );
  const [deliveryOptionId, setDeliveryOptionId] = useState(deliveryAreas[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee =
    deliveryMethod === "pickup" ? (pickupOption?.fee ?? 0) : deliveryAreas.find((o) => o.id === deliveryOptionId)?.fee ?? 0;
  const total = subtotal + deliveryFee;

  const canSubmit = useMemo(() => {
    if (items.length === 0 || submitting) return false;
    if (!customerName.trim() || !phone.trim()) return false;
    if (deliveryMethod === "delivery" && (!deliveryOptionId || !address.trim() || !city.trim())) return false;
    return true;
  }, [items.length, submitting, customerName, phone, deliveryMethod, deliveryOptionId, address, city]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          deliveryMethod,
          deliveryOptionId: deliveryMethod === "delivery" ? deliveryOptionId : undefined,
          address,
          city,
          notes,
          items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      clear();
      window.location.assign(data.redirectUrl);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted">Your cart is empty.</p>
        <Link href="/shop" className="rounded-md bg-neutral-900 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white">
          Shop Sneakers
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
      <div className="space-y-10 lg:col-span-3">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Contact</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input"
                autoComplete="name"
              />
            </Field>
            <Field label="Phone number" required>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                autoComplete="tel"
                placeholder="e.g. 077 123 4567"
              />
            </Field>
            <Field label="Email (optional)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                autoComplete="email"
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Delivery</h2>
          <div className="mt-4 flex gap-3">
            {deliveryAreas.length > 0 && (
              <MethodButton
                label="Delivery"
                active={deliveryMethod === "delivery"}
                onClick={() => setDeliveryMethod("delivery")}
              />
            )}
            {pickupOption && (
              <MethodButton
                label="Store Pickup"
                active={deliveryMethod === "pickup"}
                onClick={() => setDeliveryMethod("pickup")}
              />
            )}
          </div>

          {deliveryMethod === "delivery" ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Delivery area" required>
                <select
                  required
                  value={deliveryOptionId}
                  onChange={(e) => setDeliveryOptionId(e.target.value)}
                  className="input"
                >
                  {deliveryAreas.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} — {formatMoney(option.fee, siteConfig.currencySymbol)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="City / Town" required>
                <input required value={city} onChange={(e) => setCity(e.target.value)} className="input" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Delivery address" required>
                  <input required value={address} onChange={(e) => setAddress(e.target.value)} className="input" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Delivery notes (optional)">
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
                </Field>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Pickup is free. We&apos;ll message you on WhatsApp/Instagram once your order is ready.
            </p>
          )}
        </section>
      </div>

      <div className="lg:col-span-2">
        <div className="border border-border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Order Review</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-neutral-700">
                  {item.name} <span className="text-muted">(UK {item.size})</span> &times; {item.quantity}
                </span>
                <span className="font-medium text-neutral-900">
                  {formatMoney(item.unitPrice * item.quantity, siteConfig.currencySymbol)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatMoney(subtotal, siteConfig.currencySymbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span>{formatMoney(deliveryFee, siteConfig.currencySymbol)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-neutral-900">
              <span>Total</span>
              <span>{formatMoney(total, siteConfig.currencySymbol)}</span>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 w-full rounded-md bg-neutral-900 py-4 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? "Redirecting to Paynow…" : "Pay Now"}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            Secure checkout via Paynow. {siteConfig.legalName} never sees your card details.
          </p>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-600">
        {label}
        {required && <span className="text-neutral-400"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function MethodButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2.5 text-sm font-medium transition ${
        active ? "border border-neutral-900 bg-neutral-900 text-white" : "border border-border text-neutral-700 hover:border-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}
