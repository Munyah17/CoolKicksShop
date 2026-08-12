import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderRow } from "@/types/database";

const LOW_STOCK_THRESHOLD = 3;

export interface RevenuePoint {
  label: string;
  date: string;
  amount: number;
}

export interface DashboardStats {
  todaySales: number;
  todayOrderCount: number;
  awaitingPayment: number;
  toDispatch: number;
  lowStockCount: number;
  totalRevenue: number;
  totalOrders: number;
  recentOrders: OrderRow[];
  revenueTrend: RevenuePoint[];
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getDashboardStats(): Promise<DashboardStats> {
  const admin = createAdminClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const trendStart = new Date(startOfDay);
  trendStart.setDate(trendStart.getDate() - 6);

  const [
    { data: todayOrders },
    { count: awaitingPayment },
    { count: toDispatch },
    { data: lowStock },
    { data: recentOrders },
    { data: paidOrders, count: totalOrders },
    { data: trendOrders },
  ] = await Promise.all([
    admin
      .from("orders")
      .select("total")
      .eq("payment_status", "paid")
      .gte("created_at", startOfDay.toISOString())
      .returns<{ total: number }[]>(),
    admin.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending"),
    admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("order_status", ["paid", "processing"]),
    admin.from("product_sizes").select("id").lte("stock", LOW_STOCK_THRESHOLD).gt("stock", -1).returns<{ id: string }[]>(),
    admin.from("orders").select("*").order("created_at", { ascending: false }).limit(10).returns<OrderRow[]>(),
    admin
      .from("orders")
      .select("total", { count: "exact" })
      .eq("payment_status", "paid")
      .returns<{ total: number }[]>(),
    admin
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid")
      .gte("created_at", trendStart.toISOString())
      .returns<{ total: number; created_at: string }[]>(),
  ]);

  const revenueTrend: RevenuePoint[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(trendStart);
    day.setDate(day.getDate() + i);
    const dayKey = day.toDateString();

    const amount = (trendOrders ?? [])
      .filter((o) => new Date(o.created_at).toDateString() === dayKey)
      .reduce((sum, o) => sum + Number(o.total), 0);

    return { label: WEEKDAY_LABELS[day.getDay()], date: day.toISOString(), amount };
  });

  return {
    todaySales: (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0),
    todayOrderCount: (todayOrders ?? []).length,
    awaitingPayment: awaitingPayment ?? 0,
    toDispatch: toDispatch ?? 0,
    lowStockCount: (lowStock ?? []).length,
    totalRevenue: (paidOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0),
    totalOrders: totalOrders ?? 0,
    recentOrders: recentOrders ?? [],
    revenueTrend,
  };
}
