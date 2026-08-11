import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderDetail } from "@/lib/admin/getOrders";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const detail = await getOrderDetail(reference);
  if (!detail) notFound();

  const { order, items, payment } = detail;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-muted hover:text-neutral-900">
        &larr; All orders
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{order.reference}</h1>
        <div className="flex gap-2">
          <StatusBadge status={order.payment_status} />
          <StatusBadge status={order.order_status} />
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">Placed {new Date(order.created_at).toLocaleString()}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border border-border bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Customer</h2>
          <p className="mt-2 text-sm text-neutral-900">{order.customer_name}</p>
          <p className="text-sm text-neutral-700">{order.phone}</p>
          {order.email && <p className="text-sm text-neutral-700">{order.email}</p>}
        </div>

        <div className="border border-border bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Delivery</h2>
          <p className="mt-2 text-sm capitalize text-neutral-900">{order.delivery_method}</p>
          {order.delivery_method === "delivery" && (
            <>
              <p className="text-sm text-neutral-700">{order.address}</p>
              <p className="text-sm text-neutral-700">{order.city}</p>
            </>
          )}
          {order.delivery_notes && <p className="mt-1 text-xs text-muted">Note: {order.delivery_notes}</p>}
        </div>
      </div>

      <div className="mt-6 border border-border bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-neutral-700">
                {item.product_name} (UK {item.size}) &times; {item.quantity}
              </span>
              <span className="font-medium text-neutral-900">
                {formatMoney(item.line_total, siteConfig.currencySymbol)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatMoney(order.subtotal, siteConfig.currencySymbol)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Delivery</span>
            <span>{formatMoney(order.delivery_fee, siteConfig.currencySymbol)}</span>
          </div>
          <div className="flex justify-between font-semibold text-neutral-900">
            <span>Total</span>
            <span>{formatMoney(order.total, siteConfig.currencySymbol)}</span>
          </div>
        </div>
      </div>

      {payment && (
        <div className="mt-6 border border-border bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Payment</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted">Provider</dt>
            <dd className="text-neutral-900">{payment.provider}</dd>
            <dt className="text-muted">Paynow reference</dt>
            <dd className="text-neutral-900">{payment.paynow_reference ?? "—"}</dd>
            <dt className="text-muted">Status</dt>
            <dd>
              <StatusBadge status={payment.status} />
            </dd>
          </dl>
        </div>
      )}

      <div className="mt-6 border border-border bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Fulfilment status</h2>
        <p className="mt-1 text-xs text-muted">
          Payment status updates automatically from Paynow and cannot be set manually here.
        </p>
        <div className="mt-3 max-w-xs">
          <OrderStatusForm reference={order.reference} currentStatus={order.order_status} />
        </div>
      </div>
    </div>
  );
}
