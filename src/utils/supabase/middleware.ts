import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Middleware session handler and route protector.
 * Refreshes auth cookies and enforces route-level authentication & role checks.
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
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

  // Authenticate user via Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Protected Admin Routes (/admin, /admin/*)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role verification: check app_metadata first, fallback to profiles table
    let isAdmin = user.app_metadata?.role === "admin";
    if (!isAdmin) {
      const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as { data: { role?: string } | null; error: unknown };
      isAdmin = profile?.role === "admin";
    }

    if (!isAdmin) {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = "/account";
      unauthorizedUrl.searchParams.set("error", "unauthorized_admin");
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 2. Protected Customer Routes (/account, /orders)
  if (pathname.startsWith("/account") || pathname.startsWith("/orders")) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Auth pages redirection if already authenticated
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    if (user) {
      const redirectTo = request.nextUrl.searchParams.get("redirectTo");
      const targetPath =
        redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account";
      const targetUrl = request.nextUrl.clone();
      targetUrl.pathname = targetPath;
      targetUrl.search = "";
      return NextResponse.redirect(targetUrl);
    }
  }

  return supabaseResponse;
};

export const createClient = updateSession;
