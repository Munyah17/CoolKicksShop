import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        By placing an order with {siteConfig.legalName}, you agree to the terms below. If
        anything here is unclear, message us before you order.
      </p>
      <p>
        <strong className="text-neutral-900">Orders.</strong> An order is confirmed only once
        payment has been verified through Paynow. Product availability and prices shown at
        checkout are current at the time of purchase and re-verified by our server before your
        order is created.
      </p>
      <p>
        <strong className="text-neutral-900">Payment.</strong> All payments are processed by
        Paynow Zimbabwe. We never see or store your card or mobile money credentials.
      </p>
      <p>
        <strong className="text-neutral-900">Pricing.</strong> Prices are listed in USD and may
        change without notice. The price charged is the price shown at the time your order is
        placed.
      </p>
      <p>
        <strong className="text-neutral-900">Contact.</strong> For any questions about these
        terms, reach us via the details on our{" "}
        <a href="/contact" className="underline underline-offset-4">
          contact page
        </a>
        .
      </p>
    </LegalPage>
  );
}
