import { notFound } from "next/navigation";
import { getOrderSummary } from "@/lib/orders/getOrderSummary";
import { OrderStatus } from "@/components/checkout/OrderStatus";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ check?: string }>;
}) {
  const { reference } = await params;
  const { check } = await searchParams;

  const summary = await getOrderSummary(reference);
  if (!summary) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <OrderStatus initial={summary} shouldPoll={Boolean(check) && summary.paymentStatus === "pending"} />
    </div>
  );
}
