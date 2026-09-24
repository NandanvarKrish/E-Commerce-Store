"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownTrigger must be used inside DropdownMenu");

  return (
    <div
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn("cursor-pointer inline-flex items-center", className)}
      role="button"
      tabIndex={0}
      aria-expanded={ctx.open}
    >
      {children}
    </div>
  );
}

export function DropdownContent({
  children,
  align = "right",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownContent must be used inside DropdownMenu");

  if (!ctx.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-56 rounded-lg border border-brand-forest/15 bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95",
        align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  className,
  destructive = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  destructive?: boolean;
}) {
  const ctx = React.useContext(DropdownContext);

  const handleClick = () => {
    onClick?.();
    ctx?.setOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      role="menuitem"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-xs sm:text-sm font-medium outline-none transition-colors",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-brand-forest hover:bg-brand-forest/5 hover:text-brand-forest",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1.5 my-1.5 h-px bg-brand-forest/10", className)} />;
}
