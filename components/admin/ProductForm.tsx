"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct, uploadProductImage, type SaveProductResult } from "@/lib/admin/productActions";
import { slugify } from "@/lib/utils/slugify";
import type { ProductWithDetails } from "@/types/database";

interface SizeRow {
  size: string;
  stock: number;
}
interface ImageRow {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export function ProductForm({ product }: { product?: ProductWithDetails }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.product_sizes.map((s) => ({ size: s.size, stock: s.stock })) ?? [{ size: "", stock: 0 }]
  );
  const [images, setImages] = useState<ImageRow[]>(
    product?.product_images.map((img) => ({ url: img.url, alt: img.alt ?? "", isPrimary: img.is_primary })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const uploaded: ImageRow[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadProductImage(fd);
      if (result.ok && result.url) {
        uploaded.push({ url: result.url, alt: "", isPrimary: false });
      } else {
        setUploadError(result.error ?? `Could not upload ${file.name}.`);
      }
    }

    if (uploaded.length > 0) {
      setImages((prev) => {
        const next = [...prev, ...uploaded];
        if (!next.some((i) => i.isPrimary) && next.length > 0) next[0].isPrimary = true;
        return next;
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const [state, formAction, isPending] = useActionState<SaveProductResult | null, FormData>(
    async (_prev, formData) => saveProduct(formData),
    null
  );

  useEffect(() => {
    if (state?.ok) router.push("/admin/products");
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-2xl">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="sizesJson" value={JSON.stringify(sizes.filter((s) => s.size.trim()))} />
      <input
        type="hidden"
        name="imagesJson"
        value={JSON.stringify(images.filter((i) => i.url.trim()))}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Product name</span>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="input mt-1"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-neutral-600">URL slug</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            className="input mt-1"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Category</span>
          <input name="category" defaultValue={product?.category ?? "sneakers"} required className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Brand</span>
          <input name="brand" defaultValue={product?.brand ?? ""} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Colour</span>
          <input name="colour" defaultValue={product?.colour ?? ""} className="input mt-1" />
        </label>
        <div />

        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Price</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price ?? ""}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-neutral-600">Sale price (optional)</span>
          <input
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.sale_price ?? ""}
            className="input mt-1"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Short description</span>
          <input name="shortDescription" defaultValue={product?.short_description ?? ""} className="input mt-1" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium text-neutral-600">Description</span>
          <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className="input mt-1" />
        </label>
      </div>

      <div className="mt-4 flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Active
        </label>
      </div>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Sizes & Stock</h2>
        <div className="mt-3 space-y-2">
          {sizes.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="Size (e.g. 9)"
                value={row.size}
                onChange={(e) => setSizes(sizes.map((r, idx) => (idx === i ? { ...r, size: e.target.value } : r)))}
                className="input w-32"
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={row.stock}
                onChange={(e) =>
                  setSizes(sizes.map((r, idx) => (idx === i ? { ...r, stock: Number(e.target.value) } : r)))
                }
                className="input w-24"
              />
              <button
                type="button"
                onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))}
                className="text-xs text-muted hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSizes([...sizes, { size: "", stock: 0 }])}
          className="mt-2 text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          + Add size
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Images</h2>
        <p className="mt-1 text-xs text-muted">
          Upload image files directly (up to 50MB each), or paste a hosted URL below.
        </p>

        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="block text-sm text-neutral-700 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-white hover:file:bg-neutral-700 disabled:opacity-50"
          />
          {uploading && <p className="mt-2 text-xs text-muted">Uploading…</p>}
          {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
        </div>

        <div className="mt-3 space-y-2">
          {images.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="https://…"
                value={row.url}
                onChange={(e) => setImages(images.map((r, idx) => (idx === i ? { ...r, url: e.target.value } : r)))}
                className="input flex-1"
              />
              <input
                placeholder="Alt text"
                value={row.alt}
                onChange={(e) => setImages(images.map((r, idx) => (idx === i ? { ...r, alt: e.target.value } : r)))}
                className="input w-40"
              />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input
                  type="radio"
                  name="primaryImage"
                  checked={row.isPrimary}
                  onChange={() => setImages(images.map((r, idx) => ({ ...r, isPrimary: idx === i })))}
                />
                Primary
              </label>
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="text-xs text-muted hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setImages([...images, { url: "", alt: "", isPrimary: images.length === 0 }])}
          className="mt-2 text-sm font-medium text-neutral-900 underline underline-offset-4"
        >
          + Add image
        </button>
      </div>

      {state?.error && <p className="mt-6 text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-8 rounded-md bg-neutral-900 px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Product"}
      </button>
    </form>
  );
}
