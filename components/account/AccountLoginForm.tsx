"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export function AccountLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    router.push(searchParams.get("next") || "/account");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-6">
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
            autoComplete="username"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/account/signup" className="font-medium text-neutral-900 underline underline-offset-4">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted">
        <Link href="/checkout" className="underline underline-offset-4">
          Continue as guest
        </Link>
      </p>
    </>
  );
}
