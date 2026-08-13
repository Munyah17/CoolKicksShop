import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { siteConfig } from "@/lib/config";
import { primaryImage, isInStock } from "@/lib/catalogue/helpers";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import type { ProductWithDetails } from "@/types/database";

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const image = primaryImage(product);
  const inStock = isInStock(product);
  const onSale = product.sale_price !== null && product.sale_price < product.price;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-border bg-surface">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <ProductImagePlaceholder name={product.name} colour={product.colour} />
        )}
        {onSale && (
          <span className="absolute left-3 top-3 bg-neutral-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            Sale
          </span>
        )}
        {!inStock && (
          <span className="absolute right-3 top-3 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
          {product.colour && <p className="text-xs text-muted">{product.colour}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end text-right text-sm">
          {onSale ? (
            <>
              <span className="text-xs text-muted line-through">
                {formatMoney(product.price, siteConfig.currencySymbol)}
              </span>
              <span className="font-medium text-neutral-900">
                {formatMoney(product.sale_price!, siteConfig.currencySymbol)}
              </span>
            </>
          ) : (
            <span className="font-medium text-neutral-900">
              {formatMoney(product.price, siteConfig.currencySymbol)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
