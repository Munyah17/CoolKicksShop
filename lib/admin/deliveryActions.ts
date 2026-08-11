"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const deliveryOptionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["delivery", "pickup"]),
  fee: z.coerce.number().min(0),
  active: z.boolean(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createDeliveryOption(formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = deliveryOptionSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    fee: formData.get("fee"),
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid delivery option.");

  const admin = createAdminClient();
  await admin.from("delivery_options").insert({
    name: parsed.data.name,
    type: parsed.data.type,
    fee: parsed.data.fee,
    active: parsed.data.active,
    sort_order: parsed.data.sortOrder,
  });

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
}

export async function updateDeliveryOption(id: string, formData: FormData) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized.");

  const parsed = deliveryOptionSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    fee: formData.get("fee"),
    active: formData.get("active") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid delivery option.");

  const admin = createAdminClient();
  await admin
    .from("delivery_options")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      fee: parsed.data.fee,
      active: parsed.data.active,
      sort_order: parsed.data.sortOrder,
    })
    .eq("id", id);

  revalidatePath("/admin/delivery");
  revalidatePath("/checkout");
}
