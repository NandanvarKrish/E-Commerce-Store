import { z } from "zod";

/**
 * Schema for environment variables.
 * Ensures all required keys are defined with correct formats.
 */
const envSchema = z.object({
  // Public client-safe variables
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("placeholder-anon-key"),

  // Server-only variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const processEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

// Validate and parse environment variables safely
const parsedEnv = envSchema.safeParse(processEnv);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables in production.");
  }
}

export const env = parsedEnv.success ? parsedEnv.data : (processEnv as unknown as z.infer<typeof envSchema>);
