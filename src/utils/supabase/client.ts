import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a typed Supabase client for use in browser Client Components.
 */
export const createClient = () =>
  createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey
  );
