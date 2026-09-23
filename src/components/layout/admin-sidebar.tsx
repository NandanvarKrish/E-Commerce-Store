"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isAdminSidebarCollapsed, toggleAdminSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-brand-forest/10 bg-brand-forest text-brand-cornsilk transition-all duration-300",
        isAdminSidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand & Collapse Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-brand-cornsilk/10">
        {!isAdminSidebarCollapsed && (
          <Link href="/admin" className="font-display text-xl font-bold truncate">
            {siteConfig.name} <span className="text-xs font-mono font-normal text-brand-clay">Admin</span>
          </Link>
        )}
        <button
          onClick={toggleAdminSidebar}
          className="p-1.5 rounded hover:bg-brand-cornsilk/10 text-brand-cornsilk transition-colors ml-auto"
          aria-label={isAdminSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isAdminSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-olive text-brand-cornsilk shadow-sm"
                  : "text-brand-cornsilk/70 hover:bg-brand-cornsilk/10 hover:text-brand-cornsilk"
              )}
              title={isAdminSidebarCollapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isAdminSidebarCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Return Link */}
      <div className="p-3 border-t border-brand-cornsilk/10">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-xs font-mono text-brand-clay hover:bg-brand-cornsilk/10 hover:text-brand-cornsilk transition-colors"
          title={isAdminSidebarCollapsed ? "Return to Store" : undefined}
        >
          <Store className="h-4 w-4 flex-shrink-0" />
          {!isAdminSidebarCollapsed && <span>Exit to Store</span>}
        </Link>
      </div>
    </aside>
  );
}
