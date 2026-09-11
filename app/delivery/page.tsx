import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { formatMoney } from "@/lib/money";
import { getActiveDeliveryOptions } from "@/lib/catalogue/queries";

export const metadata: Metadata = {
  title: "Delivery",
  description: `Delivery areas and fees for ${siteConfig.legalName}.`,
};

// No per-visitor data on this page -- static + ISR instead of rendering
// fresh on every request.
export const revalidate = 60;

export default async function DeliveryPage() {
  const options = await getActiveDeliveryOptions();
  const deliveryAreas = options.filter((o) => o.type === "delivery");
  const pickup = options.find((o) => o.type === "pickup");

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Delivery</h1>
      <p className="mt-3 text-sm text-neutral-700">
        We deliver across Zimbabwe, or you can collect for free at pickup — delivery is entirely
        optional at checkout. Choose your area and the fee is added automatically.
      </p>
      <p className="mt-3 text-sm text-neutral-700">
        Fees are priced fairly, not marked up: intracity deliveries (within the same city, shop to
        your address) are priced at that day&apos;s average InDrive rate for the route. Intercity
        deliveries (town to town, city to city) are priced at prevailing professional courier rates
        (e.g. FedEx) for that day.
      </p>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {deliveryAreas.map((area) => (
          <div key={area.id} className="flex items-center justify-between py-3 text-sm">
            <span className="text-neutral-700">{area.name}</span>
            <span className="font-medium text-neutral-900">{formatMoney(area.fee, siteConfig.currencySymbol)}</span>
          </div>
        ))}
        {pickup && (
          <div className="flex items-center justify-between py-3 text-sm">
            <span className="text-neutral-700">{pickup.name}</span>
            <span className="font-medium text-neutral-900">
              {pickup.fee === 0 ? "Free" : formatMoney(pickup.fee, siteConfig.currencySymbol)}
            </span>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        Delivery times vary by area and are confirmed after your order is placed. For pickup,
        we&apos;ll message you once your order is ready.
      </p>
    </div>
  );
}
