import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  return (
    <LegalPage title="Returns & Refunds">
      <p>
        If there&apos;s a problem with your order — wrong size sent, a fault, or it doesn&apos;t
        match what was listed — message us within 48 hours of delivery via our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>{" "}
        and we&apos;ll sort it out.
      </p>
      <p>
        <strong className="text-neutral-900">Eligible returns.</strong> Unworn pairs in original
        packaging, reported within 48 hours of delivery.
      </p>
      <p>
        <strong className="text-neutral-900">Refunds.</strong> Approved refunds are issued back
        through Paynow to your original payment method.
      </p>
      <p>Payment issues (charged but no order confirmation) should also be reported here.</p>
    </LegalPage>
  );
}
