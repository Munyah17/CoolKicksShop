import { createClient } from "@/lib/supabase/server";
import type { OrderRow } from "@/types/database";

// Relies on the "customers can read their own orders" RLS policy --
// no service role needed, Postgres enforces the auth.uid() = user_id
// filter itself.
export async function getMyOrders(): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();
  return data ?? [];
}
