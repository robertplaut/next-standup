import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Read-only client for Server Components (RSC).
 * - Reads cookies
 * - Does NOT write cookies (no-op set/remove)
 * Use this in layouts/pages/components rendered on the server.
 */
export async function createSupabaseRSCClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No-ops in RSC (writing cookies here is not allowed in Next.js 15)
        set() {},
        remove() {},
      },
    }
  );
}

/**
 * Mutable client for Server Actions & Route Handlers.
 * - Reads and writes cookies (allowed in these contexts)
 * Use this inside files marked "use server" or in route handlers.
 */
export async function createSupabaseServerActionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
