"use client";

import {
  ShoppingBag,
  Heart,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import { useToastStore } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]"
    >
      {toasts.map((toast) => {
        const isCart = toast.variant === "cart";
        const isWishlist = toast.variant === "wishlist";
        const isDestructive = toast.variant === "destructive";
        const isSuccess = toast.variant === "success";

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5",
              isCart && "border-brand-olive/30 bg-brand-olive/10 text-brand-forest",
              isWishlist && "border-brand-copper/30 bg-brand-copper/10 text-brand-forest",
              isDestructive && "border-destructive/30 bg-destructive/10 text-destructive",
              isSuccess && "border-brand-olive/30 bg-brand-cornsilk text-brand-forest",
              !toast.variant || toast.variant === "default"
                ? "border-brand-forest/15 bg-card text-card-foreground"
                : ""
            )}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isCart && <ShoppingBag className="h-5 w-5 text-brand-olive" />}
              {isWishlist && <Heart className="h-5 w-5 fill-brand-copper text-brand-copper" />}
              {isSuccess && <CheckCircle2 className="h-5 w-5 text-brand-olive" />}
              {isDestructive && <AlertCircle className="h-5 w-5 text-destructive" />}
              {(!toast.variant || toast.variant === "default") && (
                <Info className="h-5 w-5 text-brand-forest/70" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold tracking-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-md p-1 text-muted-foreground/70 transition-colors hover:text-brand-forest"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
