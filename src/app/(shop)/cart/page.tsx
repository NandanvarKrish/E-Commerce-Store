"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  AlertCircle,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";

export default function CartPage() {
  const {
    items,
    isLoading,
    isSyncing,
    init,
    updateQuantity,
    removeItem,
    clearCart,
    promoCode,
    discountPercentage,
    applyPromoCode,
    removePromoCode,
    getSubtotal,
    getDiscountAmount,
    getShippingFee,
    getFinalTotal,
    hasOutOfStockItems,
  } = useCartStore();

  const { toast } = useToast();
  const [promoInput, setPromoInput] = React.useState("");
  const [isApplying, setIsApplying] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    init();
  }, [init]);

  const subtotal = mounted ? getSubtotal() : 0;
  const discount = mounted ? getDiscountAmount() : 0;
  const shipping = mounted ? getShippingFee() : 0;
  const finalTotal = mounted ? getFinalTotal() : 0;

  const freeShippingThreshold = 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const outOfStockPresent = mounted ? hasOutOfStockItems() : false;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsApplying(true);
    setTimeout(() => {
      const result = applyPromoCode(promoInput);
      setIsApplying(false);
      toast({
        title: result.success ? "Promo code applied!" : "Invalid code",
        description: result.message,
        variant: result.success ? "success" : "destructive",
      });
      if (result.success) setPromoInput("");
    }, 400);
  };

  const handleCheckout = () => {
    if (outOfStockPresent) {
      toast({
        title: "Action Required",
        description: "Please remove sold out items from your bag before proceeding.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Cart Confirmed",
      description: "Inventory verified. Proceeding to checkout sanctuary.",
      variant: "success",
    });
  };

  if (!mounted || isLoading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-olive border-t-transparent" />
          <p className="font-mono text-xs text-muted-foreground">
            Verifying your sanctuary inventory...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <div className="pb-24">
      {/* Editorial Header */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Shopping Bag" }]} className="mb-2" />
          <div className="flex items-center justify-between">
            <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-light">
              Your Shopping Sanctuary
            </h1>
            {isSyncing && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Syncing live stock...</span>
              </span>
            )}
          </div>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12">
        {items.length === 0 ? (
          <EmptyState
            title="Your shopping bag is quiet"
            description="You have not added any artisanal objects yet. Explore our curated collections of ceramics, textiles, and ritual aromatherapy."
            actionLabel="Discover Collection"
            onAction={() => (window.location.href = "/products")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Cart Items Table */}
            <div className="lg:col-span-8 space-y-6">
              {/* Out of Stock Warning Banner */}
              {outOfStockPresent && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
                  <div className="flex-1">
                    <p className="font-semibold">Some items are unavailable</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Items marked as Sold Out cannot be purchased. Please remove them to proceed.
                    </p>
                  </div>
                </div>
              )}

              {/* Free Shipping Banner */}
              <div className="rounded-xl border border-brand-forest/15 bg-brand-cornsilk/80 p-4">
                <div className="flex items-center justify-between font-mono text-xs text-brand-forest mb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Truck className="h-4 w-4 text-brand-olive" />
                    {amountToFreeShipping === 0
                      ? "Complimentary standard delivery unlocked!"
                      : `Add ${formatCurrency(amountToFreeShipping)} more to enjoy free delivery.`}
                  </span>
                  <span className="font-bold">{freeShippingProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-brand-forest/10">
                  <div
                    className="h-full bg-brand-olive transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-brand-forest/10 rounded-xl border border-brand-forest/15 bg-card overflow-hidden shadow-sm">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-brand-forest/5">
                  <span className="col-span-6">Object</span>
                  <span className="col-span-2 text-center">Unit Price</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 p-4 sm:p-5 transition-colors ${
                      item.isOutOfStock || item.isDeleted ? "bg-rose-50/40" : ""
                    }`}
                  >
                    {/* Item info */}
                    <div className="sm:col-span-6 flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5 border border-brand-forest/10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        {(item.isOutOfStock || item.isDeleted) && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-1 text-center">
                            <span className="text-[10px] font-mono font-bold text-white uppercase">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium text-sm text-brand-forest hover:text-brand-olive transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>

                        {(item.color || item.size) && (
                          <p className="font-mono text-xs text-muted-foreground mt-0.5">
                            {[item.color, item.size].filter(Boolean).join(" · ")}
                          </p>
                        )}

                        {/* Stock status badges */}
                        {item.isDeleted ? (
                          <p className="text-[11px] font-mono text-rose-700 mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Discontinued craft
                          </p>
                        ) : item.isOutOfStock ? (
                          <p className="text-[11px] font-mono text-rose-700 mt-1 flex items-center gap-1 font-semibold">
                            <AlertCircle className="h-3 w-3" />
                            Sold out in studio
                          </p>
                        ) : item.isInsufficientStock ? (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] font-mono text-amber-700">
                              Only {item.availableStock} in studio
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.availableStock)}
                              className="text-[10px] font-mono underline text-brand-copper hover:text-brand-forest"
                            >
                              Adjust to {item.availableStock}
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                            In stock ({item.availableStock} available)
                          </p>
                        )}

                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-destructive mt-1.5 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="hidden sm:block sm:col-span-2 text-center font-mono text-xs text-brand-forest">
                      {formatCurrency(item.price)}
                    </div>

                    {/* Quantity modifier */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                      <span className="sm:hidden font-mono text-xs text-muted-foreground">Qty:</span>
                      <div className="flex items-center rounded-lg border border-brand-forest/20 bg-background font-mono text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.isOutOfStock || item.isDeleted}
                          className="p-1.5 text-muted-foreground hover:text-brand-forest disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            item.isOutOfStock ||
                            item.isDeleted ||
                            item.quantity >= item.availableStock
                          }
                          className="p-1.5 text-muted-foreground hover:text-brand-forest disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="flex items-center justify-between sm:block sm:col-span-2 text-right">
                      <span className="sm:hidden font-mono text-xs text-muted-foreground">Total:</span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          item.isOutOfStock || item.isDeleted
                            ? "text-muted-foreground line-through"
                            : "text-brand-forest"
                        }`}
                      >
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                  <Link href="/products">
                    <span>← Continue Browsing</span>
                  </Link>
                </Button>
                <button
                  onClick={() => clearCart()}
                  className="font-mono text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-6">
                <h2 className="font-editorial text-xl font-normal text-brand-forest pb-3 border-b border-brand-forest/10">
                  Order Summary
                </h2>

                {/* Subtotals breakdown */}
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-brand-forest font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-brand-copper font-medium">
                      <span>Promo Savings ({discountPercentage}%)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Shipping</span>
                    <span className="text-brand-forest font-medium">
                      {shipping === 0 ? "Complimentary" : formatCurrency(shipping)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-brand-forest/10 flex justify-between text-base font-bold text-brand-forest">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  {promoCode ? (
                    <div className="flex items-center justify-between rounded-lg bg-brand-olive/10 px-3 py-2 text-xs font-mono text-brand-forest">
                      <div className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-brand-olive" />
                        <span className="font-bold">{promoCode}</span>
                        <span>({discountPercentage}% OFF)</span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Promo code (try AURA10)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="text-xs uppercase font-mono h-9"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        disabled={isApplying || !promoInput.trim()}
                        className="h-9 px-3 text-xs flex-shrink-0"
                      >
                        {isApplying ? "..." : "Apply"}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Checkout CTA */}
                <div className="pt-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={outOfStockPresent || items.length === 0}
                    className="w-full gap-2 bg-brand-forest text-brand-cornsilk hover:bg-brand-olive shadow-md"
                    size="lg"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {outOfStockPresent && (
                    <p className="text-[11px] text-center text-rose-700 mt-2 font-mono">
                      Remove sold-out items to continue
                    </p>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="space-y-2 pt-4 border-t border-brand-forest/10 text-[11px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-olive flex-shrink-0" />
                    <span>Secure encrypted checkout session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-brand-olive flex-shrink-0" />
                    <span>30-day effortless return guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-brand-olive flex-shrink-0" />
                    <span>Carbon-neutral plastic-free parcel packaging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
