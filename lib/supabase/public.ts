import { createClient } from "@supabase/supabase-js";

// Cookie-free, anon-key client for public catalogue reads (products, hero
// slides, site settings, delivery options). These reads are identical for
// every visitor -- RLS's "active = true" policies don't check auth.uid() --
// so unlike lib/supabase/server.ts this client never calls cookies(). That
// matters for two reasons:
//   1. It's safe to call from inside unstable_cache(), which forbids Request
//      APIs like cookies() in the function it wraps.
//   2. It doesn't drag the page it's used on into dynamic rendering just to
//      read data that's the same for everyone.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}
