import { Suspense } from "react";
import { AccountLoginForm } from "@/components/account/AccountLoginForm";

export default function AccountLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-14 sm:px-6">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Sign In</h1>
      <p className="mt-1 text-sm text-muted">Faster checkout, order history, saved details.</p>
      <Suspense fallback={null}>
        <AccountLoginForm />
      </Suspense>
    </div>
  );
}
