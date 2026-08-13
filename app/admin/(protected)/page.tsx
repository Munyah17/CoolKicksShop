import Link from "next/link";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RevenueChart } from "@/components/admin/RevenueChart";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <h1 className="text-xl font-semibold uppercase tracking-widest text-neutral-900">{greeting}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-7">
        <StatCard label="Today's Sales" value={formatMoney(stats.todaySales, siteConfig.currencySymbol)} />
        <StatCard label="Orders Today" value={String(stats.todayOrderCount)} />
        <StatCard label="Total Revenue" value={formatMoney(stats.totalRevenue, siteConfig.currencySymbol)} />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} />
        <StatCard label="Awaiting Payment" value={String(stats.awaitingPayment)} />
        <StatCard label="To Dispatch" value={String(stats.toDispatch)} />
        <StatCard label="Low Stock" value={String(stats.lowStockCount)} />
      </div>

      <div className="mt-8">
        <RevenueChart points={stats.revenueTrend} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-neutral-600 hover:text-neutral-900">
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto border border-border bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Order</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
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
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
