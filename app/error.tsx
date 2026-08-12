"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted">Error</p>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900">Something went wrong.</h1>
      <p className="mt-2 text-sm text-muted">Please try again, or head back to the shop.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white"
        >
          Try Again
        </button>
        <Link href="/" className="rounded-md border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest text-neutral-700">
          Go Home
        </Link>
      </div>
    </div>
  );
}
