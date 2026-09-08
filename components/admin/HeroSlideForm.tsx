"use client";

import { useRef, useState } from "react";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide, uploadHeroSlideImage } from "@/lib/admin/heroSlideActions";
import type { HeroSlideRow } from "@/types/database";

interface HeroSlideFormProps {
  slide?: HeroSlideRow;
}

export function HeroSlideForm({ slide }: HeroSlideFormProps) {
  const [imageUrl, setImageUrl] = useState(slide?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const file = files[0];
    const fd = new FormData();
    fd.set("file", file);
    const result = await uploadHeroSlideImage(fd);
    
    if (result.ok && result.url) {
      setImageUrl(result.url);
    } else {
      setUploadError(result.error ?? "Upload failed.");
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={slide ? updateHeroSlide.bind(null, slide.id) : createHeroSlide} className="space-y-3 border border-border bg-white p-4">
      {slide?.id && <input type="hidden" name="id" value={slide.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      
      <div>
        <span className="text-xs font-medium text-neutral-600">Image</span>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="block text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white hover:file:bg-neutral-700 disabled:opacity-50"
          />
          {uploading && <p className="mt-2 text-xs text-muted">Uploading…</p>}
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
        </div>
        {imageUrl && (
          <div className="mt-2">
            <img src={imageUrl} alt="Preview" className="h-32 w-auto rounded border border-border" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Headline</span>
          <input name="headline" defaultValue={slide?.headline ?? ""} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Subheadline</span>
          <input name="subheadline" defaultValue={slide?.subheadline ?? ""} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Button label</span>
          <input name="ctaLabel" defaultValue={slide?.cta_label ?? ""} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Button link</span>
          <input name="ctaHref" defaultValue={slide?.cta_href ?? ""} placeholder="/shop" className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Order</span>
          <input name="displayOrder" type="number" defaultValue={slide?.display_order ?? 0} className="input mt-1" />
        </label>
        <label className="flex items-center gap-2 pt-5 text-sm">
          <input type="checkbox" name="active" defaultChecked={slide?.active ?? true} />
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
          Save
        </button>
        {slide?.id && (
          <button
            formAction={deleteHeroSlide.bind(null, slide.id)}
            className="rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:bg-neutral-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
