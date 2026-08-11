import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";
import { getAllActiveProducts } from "@/lib/catalogue/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllActiveProducts();

  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/delivery",
    "/legal/terms",
    "/legal/privacy",
    "/legal/returns",
  ].map((path) => ({
    url: siteUrl(path),
    lastModified: new Date(),
  }));

  const productRoutes = products.map((product) => ({
    url: siteUrl(`/product/${product.slug}`),
    lastModified: new Date(product.updated_at),
  }));

  return [...staticRoutes, ...productRoutes];
}
