"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/types/database";

// Fulfilment statuses an admin may set by hand. "pending_payment" and
// "paid" are never in this list -- those only ever change as a result of
// a verified Paynow payment (see lib/orders/processPaynowResult.ts).
const ADMIN_SETTABLE_STATUSES: OrderStatus[] = [
  "processing",
  "ready_for_dispatch",
  "delivered",
  "cancelled",
];

export async function updateOrderStatus(reference: string, status: string) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  if (!ADMIN_SETTABLE_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid status.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ order_status: status }).eq("reference", reference);
  if (error) throw new Error("Could not update order.");

  revalidatePath(`/admin/orders/${reference}`);
  revalidatePath("/admin/orders");
}
