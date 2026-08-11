import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, primaryImage, isInStock } from "@/lib/catalogue/queries";
import { formatMoney } from "@/lib/money";
import { siteConfig, siteUrl } from "@/lib/config";
import { ProductImagePlaceholder } from "@/components/product/ProductImagePlaceholder";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductCard } from "@/components/product/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = primaryImage(product);
  const description = product.short_description ?? product.description ?? siteConfig.description;

  return {
    title: product.name,
    description,
    alternates: { canonical: siteUrl(`/product/${product.slug}`) },
    openGraph: {
      title: product.name,
      description,
      url: siteUrl(`/product/${product.slug}`),
      images: image ? [{ url: image.url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const image = primaryImage(product);
  const related = await getRelatedProducts(product);
  const inStock = isInStock(product);
  const onSale = product.sale_price !== null && product.sale_price < product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description ?? undefined,
    image: image ? [image.url] : undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: (product.sale_price ?? product.price).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: siteUrl(`/product/${product.slug}`),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-xs text-muted">
        <Link href="/shop" className="hover:text-neutral-900">
          Shop
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-border bg-surface">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <ProductImagePlaceholder name={product.name} colour={product.colour} />
          )}
        </div>

        <div className="lg:pt-4">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted">{product.brand}</p>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">{product.name}</h1>
          <div className="mt-2 text-lg">
            {onSale ? (
              <>
                <span className="mr-2 text-muted line-through">
                  {formatMoney(product.price, siteConfig.currencySymbol)}
                </span>
                <span className="font-semibold text-neutral-900">
                  {formatMoney(product.sale_price!, siteConfig.currencySymbol)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-neutral-900">
                {formatMoney(product.price, siteConfig.currencySymbol)}
              </span>
            )}
          </div>

          {!inStock ? (
            <p className="mt-6 text-sm font-medium text-neutral-500">This style is currently sold out.</p>
          ) : (
            <div className="mt-6">
              <AddToCartForm product={product} imageUrl={image?.url ?? null} />
            </div>
          )}

          <p className="mt-6 text-sm text-muted">
            Delivery across Zimbabwe or free store pickup. Payment secured through Paynow.
          </p>

          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-900">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
