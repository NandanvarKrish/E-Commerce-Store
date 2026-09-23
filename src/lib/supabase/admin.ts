import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import type { Database } from "@/types/database.types";

/**
 * Creates an admin Supabase client with the service role key.
 * CAUTION: Bypasses Row Level Security (RLS).
 * MUST only be imported and called in secure server-side environments.
 */
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to initialize the admin client."
    );
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
