const TINTS = ["#efe9e1", "#e9ece9", "#eae6ea", "#eee7e0", "#e6e9ec"];

function tintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

// Used wherever a product has no real photography uploaded yet. Draws a
// generic, non-brand sneaker silhouette on a soft tinted card rather than
// a broken image or a stock photo implying a specific real product.
export function ProductImagePlaceholder({
  name,
  colour,
  className = "",
}: {
  name: string;
  colour?: string | null;
  className?: string;
}) {
  const tint = tintFor(name);

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: tint }}
    >
      <svg
        viewBox="0 0 200 120"
        className="h-[45%] w-[70%] opacity-80"
        fill="none"
        stroke="#141414"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 88 C 20 60, 40 40, 60 38 C 72 37, 78 44, 88 40 C 104 34, 116 22, 132 24 C 150 26, 158 40, 172 46 C 182 50, 190 56, 190 66 C 190 80, 178 88, 160 88 Z" />
        <path d="M12 88 C 12 96, 20 100, 34 100 L 178 100 C 186 100, 190 96, 190 90" />
        <path d="M88 40 L 96 58 M104 36 L 112 56 M120 30 L 128 52" />
      </svg>
      {colour && (
        <span className="absolute bottom-3 left-3 text-[11px] font-medium uppercase tracking-widest text-neutral-500">
          {colour}
        </span>
      )}
      <span className="absolute right-3 top-3 text-[10px] uppercase tracking-widest text-neutral-400">
        Photo coming soon
      </span>
    </div>
  );
}
