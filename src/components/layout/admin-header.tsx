"use client";

import { Bell, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-brand-forest/10 bg-brand-cornsilk/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-brand-forest">Store Management</h1>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Staging Environment
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 text-brand-forest/70 hover:text-brand-forest transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-copper" />
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-brand-forest/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-olive text-brand-cornsilk">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden md:block text-left text-xs">
            <p className="font-medium text-brand-forest">Administrator</p>
            <p className="text-muted-foreground font-mono">admin@auraearth.store</p>
          </div>
        </div>
      </div>
    </header>
  );
}
