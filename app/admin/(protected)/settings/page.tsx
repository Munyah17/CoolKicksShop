import { createAdminClient } from "@/lib/supabase/admin";
import { updateSettings } from "@/lib/admin/settingsActions";
import { siteConfig } from "@/lib/config";
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

      <form action={updateSettings} className="mt-6 space-y-6 border border-border bg-white p-5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Logo</h2>
          <p className="mt-1 text-xs text-muted">
            Paste a hosted image URL (e.g. from Supabase Storage). Recommended: a wide/square mark,
            transparent background, at least 240px tall. Leave blank to show the default monogram
            mark in the header.
          </p>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Logo URL</span>
            <input name="logoUrl" defaultValue={settings?.logo_url ?? ""} placeholder="https://…" className="input mt-1" />
          </label>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Contact Details</h2>
          <p className="mt-1 text-xs text-muted">Shown on the /contact page. Leave a field blank to hide that row.</p>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Instagram URL</span>
            <input
              name="instagramUrl"
              defaultValue={settings?.instagram_url ?? ""}
              placeholder="https://www.instagram.com/…"
              className="input mt-1"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">WhatsApp number</span>
            <input
              name="whatsappNumber"
              defaultValue={settings?.whatsapp_number ?? ""}
              placeholder="e.g. 263771234567 (no + or spaces)"
              className="input mt-1"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Contact email</span>
            <input
              type="email"
              name="contactEmail"
              defaultValue={settings?.contact_email ?? ""}
              placeholder="hello@example.com"
              className="input mt-1"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Phone</span>
            <input
              name="phone"
              defaultValue={settings?.phone ?? ""}
              placeholder="e.g. 0777 317 446"
              className="input mt-1"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Address</span>
            <input
              name="address"
              defaultValue={settings?.address ?? ""}
              placeholder="e.g. 6 Trinity Close, Greendale, Harare"
              className="input mt-1"
            />
          </label>
        </div>

        <div className="border-t border-border pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Site Copy</h2>
          <p className="mt-1 text-xs text-muted">
            Leave a field blank to keep the site&apos;s default wording shown as its placeholder.
          </p>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Tagline</span>
            <input
              name="tagline"
              defaultValue={settings?.tagline ?? ""}
              placeholder={siteConfig.tagline}
              className="input mt-1"
            />
            <span className="mt-1 block text-xs text-muted">Shown in the footer and on the fallback hero.</span>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Homepage blurb heading</span>
            <input
              name="homepageBlurbHeading"
              defaultValue={settings?.homepage_blurb_heading ?? ""}
              placeholder="Hand-picked kicks, not a warehouse dump."
              className="input mt-1"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">Homepage blurb body</span>
            <textarea
              name="homepageBlurbBody"
              rows={3}
              defaultValue={settings?.homepage_blurb_body ?? ""}
              placeholder={`${siteConfig.legalName} sources a small, considered selection of sneakers each drop. No overwhelming catalogue — just pairs worth owning.`}
              className="input mt-1"
            />
            <span className="mt-1 block text-xs text-muted">
              Shown in the section between the product grids and the footer.
            </span>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-medium text-neutral-600">About page content</span>
            <textarea
              name="aboutContent"
              rows={8}
              defaultValue={settings?.about_content ?? ""}
              placeholder="Separate paragraphs with a blank line."
              className="input mt-1"
            />
            <span className="mt-1 block text-xs text-muted">
              Replaces the whole /about page body. Separate paragraphs with a blank line.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}
