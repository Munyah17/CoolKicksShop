import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: "https", hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
      : [],
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
