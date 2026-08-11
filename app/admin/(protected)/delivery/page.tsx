import { createAdminClient } from "@/lib/supabase/admin";
import { createDeliveryOption, updateDeliveryOption } from "@/lib/admin/deliveryActions";
import type { DeliveryOptionRow } from "@/types/database";

async function getAllDeliveryOptions(): Promise<DeliveryOptionRow[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("delivery_options").select("*").order("sort_order").returns<DeliveryOptionRow[]>();
  return data ?? [];
}

export default async function AdminDeliveryPage() {
  const options = await getAllDeliveryOptions();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Delivery</h1>
      <p className="mt-1 text-sm text-muted">Areas and fees shown to customers at checkout.</p>

      <div className="mt-6 space-y-4">
        {options.map((option) => (
          <form
            key={option.id}
            action={updateDeliveryOption.bind(null, option.id)}
            className="flex flex-wrap items-end gap-3 border border-border bg-white p-4"
          >
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Name</span>
              <input name="name" defaultValue={option.name} required className="input mt-1 w-40" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Type</span>
              <select name="type" defaultValue={option.type} className="input mt-1 w-32">
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Fee</span>
              <input name="fee" type="number" step="0.01" min="0" defaultValue={option.fee} className="input mt-1 w-24" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Order</span>
              <input name="sortOrder" type="number" defaultValue={option.sort_order} className="input mt-1 w-20" />
            </label>
            <label className="flex items-center gap-2 pb-2.5 text-sm">
              <input type="checkbox" name="active" defaultChecked={option.active} />
              Active
            </label>
            <button
              type="submit"
              className="bg-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white"
            >
              Save
            </button>
          </form>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Add area</h2>
        <form action={createDeliveryOption} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">Name</span>
            <input name="name" required className="input mt-1 w-40" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">Type</span>
            <select name="type" defaultValue="delivery" className="input mt-1 w-32">
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">Fee</span>
            <input name="fee" type="number" step="0.01" min="0" defaultValue={0} className="input mt-1 w-24" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">Order</span>
            <input name="sortOrder" type="number" defaultValue={options.length} className="input mt-1 w-20" />
          </label>
          <label className="flex items-center gap-2 pb-2.5 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            Active
          </label>
          <button
            type="submit"
            className="bg-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
