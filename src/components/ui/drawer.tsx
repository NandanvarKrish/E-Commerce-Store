"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: "right" | "left" | "bottom";
  className?: string;
  children: React.ReactNode;
}

export function Drawer({
  open,
  onOpenChange,
  position = "right",
  className,
  children,
}: DrawerProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-forest/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      <div
        className={cn(
          "fixed z-50 flex flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          position === "right" &&
            "inset-y-0 right-0 h-full w-full max-w-md border-l border-brand-forest/15 animate-in slide-in-from-right",
          position === "left" &&
            "inset-y-0 left-0 h-full w-full max-w-md border-r border-brand-forest/15 animate-in slide-in-from-left",
          position === "bottom" &&
            "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl border-t border-brand-forest/15 animate-in slide-in-from-bottom",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DrawerHeader({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-brand-forest/10 px-6 py-4",
        className
      )}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-brand-forest/5 hover:text-brand-forest transition-colors ml-4"
          aria-label="Close drawer"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function DrawerContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-6 py-4", className)}
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-brand-forest/10 px-6 py-4", className)}
      {...props}
    />
  );
}
