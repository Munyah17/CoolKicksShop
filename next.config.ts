import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hero slides, the logo, and product photos are admin-curated URLs that
    // can come from a few places: our own Supabase Storage buckets (current),
    // or Cloudinary (older slides seeded before the direct-upload feature).
    // Anything not listed here makes next/image respond 400 and render a
    // broken-image placeholder.
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  // Default is 1MB, which rejects any real photo straight out of a phone
  // camera. Keep this in sync with the MAX_SIZE check in the upload server
  // actions (lib/admin/*Actions.ts) — if this is lower, the request is
  // rejected by the framework before the action's own error message runs.
  experimental: {
    serverActions: {
      bodySizeLimit: "150mb",
    },
  },
};

export default nextConfig;
