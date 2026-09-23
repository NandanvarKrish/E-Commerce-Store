import { createClient } from "@/utils/supabase/client";

export const getStorageKey = (userId?: string) =>
  userId ? `aura_gemini_api_key_${userId}` : "aura_gemini_api_key_guest";

/**
 * Retrieves the stored Gemini API key from localStorage for a specific user.
 */
export function getStoredGeminiKey(userId?: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(getStorageKey(userId));
}

/**
 * Saves the Gemini API key into localStorage for a specific user.
 */
export function setStoredGeminiKey(key: string, userId?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userId), key.trim());
}

/**
 * Clears the stored Gemini API key from localStorage for a specific user.
 */
export function removeStoredGeminiKey(userId?: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getStorageKey(userId));
}

/**
 * Persists the user's personal Gemini API key directly to their Supabase user profile.
 */
export async function saveGeminiKeyToSupabase(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "You must be signed in to save to your cloud profile." };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        gemini_api_key: key.trim(),
      },
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Also update local cache for fast offline access
    setStoredGeminiKey(key, user.id);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save key to profile.",
    };
  }
}

/**
 * Retrieves the user's personal Gemini API key from Supabase user metadata.
 */
export async function loadGeminiKeyFromSupabase(): Promise<{ key: string | null; userEmail: string | null; userId: string | null }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { key: null, userEmail: null, userId: null };
    }

    const remoteKey = (user.user_metadata?.gemini_api_key as string) || null;
    const localKey = getStoredGeminiKey(user.id);
    const key = remoteKey || localKey || null;

    if (remoteKey && !localKey) {
      setStoredGeminiKey(remoteKey, user.id);
    }

    return { key, userEmail: user.email || null, userId: user.id };
  } catch {
    return { key: null, userEmail: null, userId: null };
  }
}
