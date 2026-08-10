import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// RLS-respecting client for use in Server Components, Route Handlers, and
// Server Actions. Reads/writes the user's auth session via cookies -- this
// is what admin pages use to find out "who is logged in", never the
// service role client.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render -- the middleware
            // handles session refresh in that case, so this is safe to ignore.
          }
        },
      },
    }
  );
}
