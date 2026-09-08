import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { SettingsRow } from "@/types/database";

async function getSettings(): Promise<SettingsRow | null> {
  const admin = createAdminClient();
  const { data } = await admin.from("settings").select("*").eq("id", true).maybeSingle<SettingsRow>();
  return data;
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
