"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/context";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { ProductImagePlaceholder } from "@/components/product/ProductImagePlaceholder";
import { SizeSelect } from "@/components/cart/SizeSelect";

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const hasUnselectedSizes = items.some((i) => !i.size);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-neutral-900">Your cart is waiting.</h1>
        <Link href="/shop" className="rounded-md bg-neutral-900 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white">
          Shop Sneakers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Your Cart</h1>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={`${item.productId}-${item.size}`} className="flex gap-4 py-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-surface">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill sizes="96px" className="object-cover" />
              ) : (
                <ProductImagePlaceholder name={item.name} />
              )}
            </div>
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/product/${item.slug}`} className="text-sm font-medium text-neutral-900 hover:underline">
                  {item.name}
                </Link>
                <div className="mt-1.5">
                  <SizeSelect item={item} />
                </div>
                <p className="mt-1 text-sm text-neutral-700 sm:hidden">
                  {formatMoney(item.unitPrice, siteConfig.currencySymbol)}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-6 sm:mt-0">
                <div className="flex items-center border border-border">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                  >
                    <MinusIcon className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="hidden w-20 text-right text-sm font-medium text-neutral-900 sm:block">
                  {formatMoney(item.unitPrice * item.quantity, siteConfig.currencySymbol)}
                </p>
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

      <div className="mt-6 flex flex-col items-end gap-1">
        <div className="flex w-full max-w-xs justify-between text-sm sm:w-64">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium text-neutral-900">{formatMoney(subtotal, siteConfig.currencySymbol)}</span>
        </div>
        <p className="w-full max-w-xs text-right text-xs text-muted sm:w-64">Delivery calculated at checkout.</p>
        {hasUnselectedSizes ? (
          <p className="mt-4 w-full max-w-xs text-right text-xs text-red-600 sm:w-64">
            Please select a size for every item before checking out.
          </p>
        ) : (
          <Link
            href="/checkout"
            className="mt-4 w-full max-w-xs rounded-md bg-neutral-900 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 sm:w-64"
          >
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
