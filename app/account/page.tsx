import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/account/getMyOrders";
import { signOutCustomer } from "@/lib/account/authActions";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { StatusBadge } from "@/components/admin/StatusBadge";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login?next=/account");

  const orders = await getMyOrders();
  const lifetimeSpend = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Your Account</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
          <p className="mt-0.5 text-xs text-muted">Member since {memberSince}</p>
        </div>
        <form action={signOutCustomer}>
          <button className="rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:bg-neutral-50">
            Sign Out
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Orders</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{orders.length}</p>
        </div>
        <div className="border border-border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Total Spent</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">
            {formatMoney(lifetimeSpend, siteConfig.currencySymbol)}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-neutral-900">
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="mt-4 border border-border bg-white p-6 text-center">
          <p className="text-sm text-muted">No orders yet.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between py-4">
              <div>
                <Link href={`/order/${order.reference}`} className="text-sm font-medium text-neutral-900 hover:underline">
                  {order.reference}
                </Link>
                <p className="mt-0.5 text-xs text-muted">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutral-700">{formatMoney(order.total, siteConfig.currencySymbol)}</span>
                <StatusBadge status={order.order_status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
