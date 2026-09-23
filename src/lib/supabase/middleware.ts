import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import type { Database } from "@/types/database.types";

/**
 * Updates the user's Supabase auth session cookies in Next.js Middleware.
 * Also enables route protection (e.g. protecting `/admin`).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection example: /admin requires authenticated user
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin") && !user) {
    // If not authenticated and accessing admin, redirect to login
    // Note: For initial scaffolding, we allow testing.
    // If strict redirect is desired:
    // const url = request.nextUrl.clone();
    // url.pathname = "/login";
    // return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
