import { notFound } from "next/navigation";
import { MockCheckout } from "@/components/dev/MockCheckout";

export default async function DevPaynowPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; amount?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { reference, amount } = await searchParams;
  if (!reference) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <MockCheckout reference={reference} amount={amount ?? "0.00"} />
    </div>
  );
}
