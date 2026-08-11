import Link from "next/link";
import { siteConfig, whatsappLink } from "@/lib/config";
import { getFeaturedProducts, getNewArrivals } from "@/lib/catalogue/queries";
import { ProductCard } from "@/components/product/ProductCard";

export default async function HomePage() {
  const [newArrivals, featured] = await Promise.all([getNewArrivals(4), getFeaturedProducts(4)]);

  return (
    <div>
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-neutral-950 px-6 text-center text-white">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">
          {siteConfig.legalName}
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
          {siteConfig.brandName.toUpperCase()}
        </h1>
        <p className="mt-5 max-w-md text-balance text-base text-neutral-300 sm:text-lg">
          &ldquo;{siteConfig.tagline}&rdquo;
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-neutral-900 transition hover:bg-neutral-200"
        >
          Shop Now
        </Link>
      </section>

      {newArrivals.length > 0 && (
        <ProductSection title="New Arrivals" viewAllHref="/shop?sort=newest" products={newArrivals} />
      )}

      {featured.length > 0 && (
        <ProductSection title="Featured Kicks" viewAllHref="/shop" products={featured} />
      )}

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Hand-picked kicks, not a warehouse dump.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
            {siteConfig.legalName} sources a small, considered selection of sneakers each drop.
            No overwhelming catalogue — just pairs worth owning.
          </p>
          <Link href="/about" className="mt-6 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4">
            More about us
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 text-center sm:grid-cols-3">
        <Reassurance title="Delivery" body="Delivery across Harare, Chitungwiza, Bulawayo and beyond, or free store pickup." />
        <Reassurance title="Payment" body="Secure checkout through Paynow. We never see or store your card details." />
        <Reassurance
          title="Contact"
          body="Questions about a pair? Message us on Instagram or WhatsApp."
          href={whatsappLink()}
        />
      </section>
    </div>
  );
}

function ProductSection({
  title,
  viewAllHref,
  products,
}: {
  title: string;
  viewAllHref: string;
  products: Awaited<ReturnType<typeof getFeaturedProducts>>;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
          View all
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function Reassurance({ title, body, href }: { title: string; body: string; href?: string }) {
  const content = (
    <>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}
