import { getActiveDeliveryOptions } from "@/lib/catalogue/queries";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const deliveryOptions = await getActiveDeliveryOptions();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Checkout</h1>
      <CheckoutForm deliveryOptions={deliveryOptions} />
    </div>
  );
}
