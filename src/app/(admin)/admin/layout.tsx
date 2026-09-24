import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

/**
 * Server-side protected layout for the Admin Portal.
 * Enforces authentication and admin role verification on the server before rendering.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  // Server-side authoritative role check
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
    redirect("/account?error=unauthorized_admin");
  }

  return (
    <div className="flex min-h-screen bg-brand-cornsilk/30">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
