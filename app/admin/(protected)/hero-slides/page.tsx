import { createAdminClient } from "@/lib/supabase/admin";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/lib/admin/heroSlideActions";
import type { HeroSlideRow } from "@/types/database";

async function getAllHeroSlides(): Promise<HeroSlideRow[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("hero_slides").select("*").order("display_order").returns<HeroSlideRow[]>();
  return data ?? [];
}

export default async function AdminHeroSlidesPage() {
  const slides = await getAllHeroSlides();

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Hero Slides</h1>
      <p className="mt-1 text-sm text-muted">
        The homepage hero rotates through up to 5 active slides. Recommended image size:{" "}
        <strong className="text-neutral-900">1920 × 800px</strong> (landscape, ~2.4:1), JPG or
        WEBP, ideally under 300KB. Text/logo elements in the image should stay clear of the
        outer ~10% on each side so they aren&apos;t cropped on narrow screens.
      </p>

      <div className="mt-6 space-y-4">
        {slides.map((slide) => (
          <form
            key={slide.id}
            action={updateHeroSlide.bind(null, slide.id)}
            className="space-y-3 border border-border bg-white p-4"
          >
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Image URL</span>
              <input name="imageUrl" defaultValue={slide.image_url} required className="input mt-1" />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-neutral-600">Headline</span>
                <input name="headline" defaultValue={slide.headline ?? ""} className="input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-600">Subheadline</span>
                <input name="subheadline" defaultValue={slide.subheadline ?? ""} className="input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-600">Button label</span>
                <input name="ctaLabel" defaultValue={slide.cta_label ?? ""} className="input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-600">Button link</span>
                <input name="ctaHref" defaultValue={slide.cta_href ?? ""} placeholder="/shop" className="input mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-neutral-600">Order</span>
                <input name="displayOrder" type="number" defaultValue={slide.display_order} className="input mt-1" />
              </label>
              <label className="flex items-center gap-2 pt-5 text-sm">
                <input type="checkbox" name="active" defaultChecked={slide.active} />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
                Save
              </button>
              <button
                formAction={deleteHeroSlide.bind(null, slide.id)}
                className="rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:bg-neutral-50"
              >
                Delete
              </button>
            </div>
          </form>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Add slide</h2>
        <form action={createHeroSlide} className="mt-3 space-y-3 border border-border bg-white p-4">
          <label className="block">
            <span className="text-xs font-medium text-neutral-600">Image URL</span>
            <input name="imageUrl" required placeholder="https://…" className="input mt-1" />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Headline</span>
              <input name="headline" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Subheadline</span>
              <input name="subheadline" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Button label</span>
              <input name="ctaLabel" defaultValue="Shop Now" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Button link</span>
              <input name="ctaHref" defaultValue="/shop" className="input mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-neutral-600">Order</span>
              <input name="displayOrder" type="number" defaultValue={slides.length} className="input mt-1" />
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm">
              <input type="checkbox" name="active" defaultChecked />
              Active
            </label>
          </div>
          <button type="submit" className="rounded-md bg-neutral-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white">
            Add Slide
          </button>
        </form>
      </div>
    </div>
  );
}
