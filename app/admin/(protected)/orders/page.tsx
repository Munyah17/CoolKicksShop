import Link from "next/link";
import { listOrders } from "@/lib/admin/getOrders";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { StatusBadge } from "@/components/admin/StatusBadge";

const statusFilters = [
  { value: "", label: "All" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "ready_for_dispatch", label: "Ready / Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "", q = "" } = await searchParams;
  const orders = await listOrders({ status, q });

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Orders</h1>

      <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by reference, name or phone…"
          className="input sm:max-w-xs"
        />
        <select name="status" defaultValue={status} className="input sm:max-w-xs">
          {statusFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-border bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.reference}`} className="font-medium text-neutral-900 hover:underline">
                    {order.reference}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-700">{order.customer_name}</td>
                <td className="px-4 py-3 text-neutral-700">{formatMoney(order.total, siteConfig.currencySymbol)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.payment_status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.order_status} />
                </td>
                <td className="px-4 py-3 text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
