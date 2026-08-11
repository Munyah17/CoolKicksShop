import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/dev", "/checkout", "/cart", "/order"],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
