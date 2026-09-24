"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/use-ui-store";
import { useCartStore } from "@/stores/use-cart-store";
import { formatCurrency } from "@/utils/formatters";

export function CartDrawer() {
  const { isCartDrawerOpen, setCartDrawerOpen } = useUIStore();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  const subtotal = getSubtotal();
  const totalCount = getTotalItems();
  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <Drawer
      open={isCartDrawerOpen}
      onOpenChange={setCartDrawerOpen}
      position="right"
      className="max-w-md"
    >
      <DrawerHeader onClose={() => setCartDrawerOpen(false)}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-brand-forest" />
          <h2 className="font-display text-lg font-bold text-brand-forest">
            Shopping Bag ({totalCount})
          </h2>
        </div>
      </DrawerHeader>

      <DrawerContent className="p-0">
        {/* Free Shipping Progress Bar */}
        <div className="border-b border-brand-forest/10 bg-brand-cornsilk/80 p-4">
          <p className="text-xs font-mono text-brand-forest mb-1.5 flex justify-between">
            <span>
              {amountToFreeShipping === 0
                ? "You've unlocked complimentary standard shipping!"
                : `Add ${formatCurrency(amountToFreeShipping)} for complimentary shipping`}
            </span>
            <span className="font-semibold">{freeShippingProgress}%</span>
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-forest/10">
            <div
              className="h-full bg-brand-olive transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        {items.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-forest/5 text-muted-foreground mb-3">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-base font-medium text-brand-forest">
              Your bag is empty
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Explore our mindful collection of ceramics, textiles, and botanical essentials.
            </p>
            <Button
              onClick={() => setCartDrawerOpen(false)}
              asChild
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Link href="/products">Explore Catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-brand-forest/10 p-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 pt-3 first:pt-0">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setCartDrawerOpen(false)}
                        className="text-xs font-semibold text-brand-forest hover:text-brand-olive transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {(item.color || item.size) && (
                      <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded border border-brand-forest/20 bg-background font-mono text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-muted-foreground hover:text-brand-forest transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-muted-foreground hover:text-brand-forest transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-semibold text-brand-forest">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DrawerContent>

      {items.length > 0 && (
        <DrawerFooter className="bg-card">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-muted-foreground">Estimated Subtotal</span>
              <span className="font-semibold text-brand-forest">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Taxes and complimentary shipping calculated during checkout.
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => setCartDrawerOpen(false)}
              asChild
              className="w-full gap-2"
              variant="default"
              size="lg"
            >
              <Link href="/cart">
                <span>View Bag & Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              onClick={() => setCartDrawerOpen(false)}
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-brand-forest"
            >
              Continue Shopping
            </Button>
          </div>
        </DrawerFooter>
      )}
    </Drawer>
  );
}
