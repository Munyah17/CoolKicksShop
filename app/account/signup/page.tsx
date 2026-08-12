"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function AccountSignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setError(signUpError.message.includes("already") ? "An account with that email already exists." : "Could not create account. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-14 sm:px-6">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Create an Account</h1>
      <p className="mt-1 text-sm text-muted">Optional — you can always check out as a guest instead.</p>

      <form onSubmit={handleSubmit} className="mt-6">
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Full name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" autoComplete="name" />
        </label>
        <label className="mt-4 block">
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
            autoComplete="new-password"
          />
        </label>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-neutral-900 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="font-medium text-neutral-900 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
