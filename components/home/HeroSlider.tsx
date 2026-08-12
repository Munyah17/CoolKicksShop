"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSlideRow } from "@/types/database";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

const AUTOPLAY_MS = 5500;

// Dark gradient pairs for slides with no photography uploaded yet -- keeps
// the slider fully usable before real hero images exist, same idea as
// ProductImagePlaceholder for product photos.
const GRADIENTS = [
  "linear-gradient(135deg, #1c1c1c, #3a3a3a)",
  "linear-gradient(135deg, #1a2320, #35443d)",
  "linear-gradient(135deg, #201a23, #423a48)",
  "linear-gradient(135deg, #231a1a, #483434)",
  "linear-gradient(135deg, #1a1e23, #34404a)",
];

function gradientFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function HeroSlider({ slides }: { slides: HeroSlideRow[] }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timerRef.current = setTimeout(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, slides.length]);

  function goTo(i: number) {
    setActive((i + slides.length) % slides.length);
  }

  return (
    <section
      className="relative min-h-[80vh] overflow-hidden bg-neutral-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === active ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {slide.image_url ? (
            <Image
              src={slide.image_url}
              alt={slide.headline ?? ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: gradientFor(slide.id) }} />
          )}
          <div className="absolute inset-0 bg-neutral-950/40" />
          <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center text-white">
            {slide.headline && (
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-balance sm:text-6xl">
                {slide.headline}
              </h1>
            )}
            {slide.subheadline && (
              <p className="mt-5 max-w-md text-balance text-base text-neutral-200 sm:text-lg">
                {slide.subheadline}
              </p>
            )}
            {slide.cta_label && slide.cta_href && (
              <Link
                href={slide.cta_href}
                className="mt-8 rounded-md bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-neutral-900 transition hover:bg-neutral-200"
              >
                {slide.cta_label}
              </Link>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40 sm:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40 sm:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
