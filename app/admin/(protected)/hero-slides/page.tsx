import { createAdminClient } from "@/lib/supabase/admin";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/lib/admin/heroSlideActions";
import { HeroSlideForm } from "@/components/admin/HeroSlideForm";
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
        outer ~10% on each side so they aren&apos;t cropped on narrow screens. Upload image files directly from your device.
      </p>

      <div className="mt-6 space-y-4">
        {slides.map((slide) => (
          <HeroSlideForm key={slide.id} slide={slide} />
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">Add slide</h2>
        <div className="mt-3">
          <HeroSlideForm />
        </div>
      </div>
    </div>
  );
}
