"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/context";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { ProductImagePlaceholder } from "@/components/product/ProductImagePlaceholder";

export function CartDrawer() {
  const { items, isOpen, close, subtotal, setQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 bg-neutral-900/40"
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Your Cart</h2>
          <button onClick={close} aria-label="Close cart" className="p-1 text-neutral-500 hover:text-neutral-900">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-muted">Your cart is waiting.</p>
            <Link
              href="/shop"
              onClick={close}
              className="bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white"
            >
              Shop Sneakers
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex gap-3 py-4 first:pt-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-surface">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <ProductImagePlaceholder name={item.name} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                        <p className="text-xs text-muted">Size {item.size}</p>
                      </div>
                      <p className="shrink-0 text-sm font-medium text-neutral-900">
                        {formatMoney(item.unitPrice * item.quantity, siteConfig.currencySymbol)}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-border">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-xs text-muted underline-offset-2 hover:text-neutral-900 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-neutral-900">
                  {formatMoney(subtotal, siteConfig.currencySymbol)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">Delivery calculated at checkout.</p>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 block w-full bg-neutral-900 py-3 text-center text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
