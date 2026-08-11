import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">404</p>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900">We couldn&apos;t find that page.</h1>
      <p className="mt-2 text-sm text-muted">It may have sold out or moved.</p>
      <Link href="/shop" className="mt-6 bg-neutral-900 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white">
        Shop Sneakers
      </Link>
    </div>
  );
}
