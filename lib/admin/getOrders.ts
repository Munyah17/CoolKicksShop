import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItemRow, OrderRow, PaymentRow } from "@/types/database";

export async function listOrders(filters: { status?: string; q?: string }): Promise<OrderRow[]> {
  const admin = createAdminClient();
  let query = admin.from("orders").select("*").order("created_at", { ascending: false }).limit(200);

  if (filters.status) {
    query = query.eq("order_status", filters.status);
  }
  if (filters.q) {
    const needle = filters.q.trim();
    if (needle) {
      query = query.or(`reference.ilike.%${needle}%,customer_name.ilike.%${needle}%,phone.ilike.%${needle}%`);
    }
  }

  const { data } = await query.returns<OrderRow[]>();
  return data ?? [];
}

export interface OrderDetail {
  order: OrderRow;
  items: OrderItemRow[];
  payment: PaymentRow | null;
}

export async function getOrderDetail(reference: string): Promise<OrderDetail | null> {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle<OrderRow>();

  if (!order) return null;

  const [{ data: items }, { data: payment }] = await Promise.all([
    admin.from("order_items").select("*").eq("order_id", order.id).returns<OrderItemRow[]>(),
    admin.from("payments").select("*").eq("order_id", order.id).maybeSingle<PaymentRow>(),
  ]);

  return { order, items: items ?? [], payment: payment ?? null };
}
