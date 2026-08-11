import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow } from "@/types/database";

const LOW_STOCK_THRESHOLD = 3;

export interface DashboardStats {
  todaySales: number;
  todayOrderCount: number;
  awaitingPayment: number;
  toDispatch: number;
  lowStockCount: number;
  recentOrders: OrderRow[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const admin = createAdminClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ data: todayOrders }, { count: awaitingPayment }, { count: toDispatch }, { data: lowStock }, { data: recentOrders }] =
    await Promise.all([
      admin
        .from("orders")
        .select("total")
        .eq("payment_status", "paid")
        .gte("created_at", startOfDay.toISOString())
        .returns<{ total: number }[]>(),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "pending"),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("order_status", ["paid", "processing"]),
      admin.from("product_sizes").select("id").lte("stock", LOW_STOCK_THRESHOLD).gt("stock", -1).returns<{ id: string }[]>(),
      admin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)
        .returns<OrderRow[]>(),
    ]);

  return {
    todaySales: (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0),
    todayOrderCount: (todayOrders ?? []).length,
    awaitingPayment: awaitingPayment ?? 0,
    toDispatch: toDispatch ?? 0,
    lowStockCount: (lowStock ?? []).length,
    recentOrders: recentOrders ?? [],
  };
}
