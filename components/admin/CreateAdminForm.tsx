"use client";

import { useActionState } from "react";
import { createAdminUser, type ActionResult } from "@/lib/admin/userActions";

export function CreateAdminForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => createAdminUser(formData),
    null
  );

  return (
    <form action={formAction} className="mt-3 space-y-3 border border-border bg-white p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Email</span>
          <input type="email" name="email" required className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Password</span>
          <input type="password" name="password" required minLength={6} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Role</span>
          <select name="role" defaultValue="admin" className="input mt-1">
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">Admin account created.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Add Admin"}
      </button>
    </form>
  );
}
