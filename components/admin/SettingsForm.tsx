"use client";

import { useActionState, useRef, useState } from "react";
import { removeLogoImage, updateSettings, uploadLogoImage } from "@/lib/admin/settingsActions";
import type { SettingsRow } from "@/types/database";

interface SettingsFormProps {
  settings?: SettingsRow | null;
}

type FieldName =
  | "logoUrl"
  | "instagramUrl"
  | "whatsappNumber"
  | "contactEmail"
  | "address"
  | "phone"
  | "tagline"
  | "homepageBlurbHeading"
  | "homepageBlurbBody"
  | "aboutContent";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span className="mt-1 block text-xs font-medium text-red-600" role="alert">
      {msg}
    </span>
  );
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateSettings, undefined);
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = state?.errors;
  const errClass = (name: FieldName) =>
    errors?.[name] ? " border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500" : "";

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const file = files[0];
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadLogoImage(fd);

    if (result.ok && result.url) {
      setLogoUrl(result.url);
    } else {
      setUploadError(result.error ?? "Upload failed.");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemoveLogo() {
    setRemoving(true);
    setUploadError(null);
    const result = await removeLogoImage();
    if (result.ok) {
      setLogoUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      setUploadError(result.error ?? "Could not remove the logo.");
    }
    setRemoving(false);
  }

  return (
    <form action={formAction} className="mt-6 space-y-6 border border-border bg-white p-5">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Logo</h2>
        <p className="mt-1 text-xs text-muted">
          Upload an image file directly from your device. Recommended: a wide/square mark,
          transparent background, at least 240px tall. Remove the logo to show the default
          monogram mark in the header.
        </p>
        <input type="hidden" name="logoUrl" value={logoUrl} />

        {logoUrl && (
          <div className="mt-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt="Current logo"
              className="h-16 w-auto rounded border border-border bg-neutral-50 p-1"
            />
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={removing || uploading}
              className="rounded-md border border-border px-3 py-2 text-xs font-semibold uppercase tracking-widest text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {removing ? "Removing…" : "Remove logo"}
            </button>
          </div>
        )}

        <div className="mt-4">
          <span className="text-xs font-medium text-neutral-600">
            {logoUrl ? "Replace with a new image" : "Upload an image"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={uploading || removing}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="mt-1 block text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white hover:file:bg-neutral-700 disabled:opacity-50"
          />
          {uploading && <p className="mt-2 text-xs text-muted">Uploading…</p>}
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
          {logoUrl && !uploading && (
            <p className="mt-2 text-xs text-muted">
              Click <span className="font-medium">Save</span> below to apply a replaced logo. Removing
              takes effect immediately.
            </p>
          )}
        </div>
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
            aria-invalid={Boolean(errors?.instagramUrl)}
            className={`input mt-1${errClass("instagramUrl")}`}
          />
          <FieldError msg={errors?.instagramUrl} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">WhatsApp number</span>
          <input
            name="whatsappNumber"
            defaultValue={settings?.whatsapp_number ?? ""}
            placeholder="e.g. 263771234567 (no + or spaces)"
            aria-invalid={Boolean(errors?.whatsappNumber)}
            className={`input mt-1${errClass("whatsappNumber")}`}
          />
          <FieldError msg={errors?.whatsappNumber} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">Contact email</span>
          <input
            type="email"
            name="contactEmail"
            defaultValue={settings?.contact_email ?? ""}
            placeholder="hello@example.com"
            aria-invalid={Boolean(errors?.contactEmail)}
            className={`input mt-1${errClass("contactEmail")}`}
          />
          <FieldError msg={errors?.contactEmail} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">Phone</span>
          <input
            name="phone"
            defaultValue={settings?.phone ?? ""}
            placeholder="e.g. 0777 317 446"
            aria-invalid={Boolean(errors?.phone)}
            className={`input mt-1${errClass("phone")}`}
          />
          <FieldError msg={errors?.phone} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">Address</span>
          <input
            name="address"
            defaultValue={settings?.address ?? ""}
            placeholder="e.g. 6 Trinity Close, Greendale, Harare"
            aria-invalid={Boolean(errors?.address)}
            className={`input mt-1${errClass("address")}`}
          />
          <FieldError msg={errors?.address} />
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
            placeholder="Your tagline here"
            aria-invalid={Boolean(errors?.tagline)}
            className={`input mt-1${errClass("tagline")}`}
          />
          <FieldError msg={errors?.tagline} />
          <span className="mt-1 block text-xs text-muted">Shown in the footer and on the fallback hero.</span>
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">Homepage blurb heading</span>
          <input
            name="homepageBlurbHeading"
            defaultValue={settings?.homepage_blurb_heading ?? ""}
            placeholder="Hand-picked kicks, not a warehouse dump."
            aria-invalid={Boolean(errors?.homepageBlurbHeading)}
            className={`input mt-1${errClass("homepageBlurbHeading")}`}
          />
          <FieldError msg={errors?.homepageBlurbHeading} />
        </label>
        <label className="mt-4 block">
          <span className="text-xs font-medium text-neutral-600">Homepage blurb body</span>
          <textarea
            name="homepageBlurbBody"
            rows={3}
            defaultValue={settings?.homepage_blurb_body ?? ""}
            placeholder="Your blurb here"
            aria-invalid={Boolean(errors?.homepageBlurbBody)}
            className={`input mt-1${errClass("homepageBlurbBody")}`}
          />
          <FieldError msg={errors?.homepageBlurbBody} />
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
            aria-invalid={Boolean(errors?.aboutContent)}
            className={`input mt-1${errClass("aboutContent")}`}
          />
          <FieldError msg={errors?.aboutContent} />
          <span className="mt-1 block text-xs text-muted">
            Replaces the whole /about page body. Separate paragraphs with a blank line.
          </span>
        </label>
      </div>

      {state && (
        <p
          role="status"
          aria-live="polite"
          className={`rounded-md border px-3 py-2 text-sm ${
            state.ok
              ? "border-green-300 bg-green-50 text-green-800"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || uploading || removing}
        className="rounded-md bg-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
