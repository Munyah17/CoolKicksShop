import { createBrowserClient } from "@supabase/ssr";

// Anon-key client for Client Components -- currently only the admin
// login form needs to talk to Supabase Auth directly from the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
