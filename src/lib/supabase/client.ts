import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";
import type { Database } from "@/types/database.types";

/**
 * Creates a Supabase client for use in Client Components (browser-side).
 * It automatically handles token refreshes and cookie storage in the browser.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
