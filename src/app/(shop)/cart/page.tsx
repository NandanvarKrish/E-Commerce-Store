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
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";

export default function CartPage() {
  const {
    items,
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
  } = useCartStore();

  const { toast } = useToast();
  const [promoInput, setPromoInput] = React.useState("");
  const [isApplying, setIsApplying] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleCheckoutPlaceholder = () => {
    toast({
      title: "Checkout Flow Preview",
      description: "Payment gateway and address capture will be enabled in Phase 2.",
      variant: "default",
    });
  };

  if (!mounted) {
    return (
      <Container className="py-16 text-center">
        <p className="font-mono text-xs text-muted-foreground">Loading your sanctuary bag...</p>
      </Container>
    );
  }

  return (
    <div className="pb-24">
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Shopping Bag" }]} className="mb-2" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-forest">
            Your Shopping Sanctuary
          </h1>
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
              <div className="divide-y divide-brand-forest/10 rounded-xl border border-brand-forest/15 bg-card overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 text-[11px] font-mono uppercase tracking-wider text-muted-foreground bg-brand-forest/5">
                  <span className="col-span-6">Object</span>
                  <span className="col-span-2 text-center">Unit Price</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Subtotal</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-4 p-4 sm:p-5"
                  >
                    {/* Item info */}
                    <div className="sm:col-span-6 flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
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
                    <div className="hidden sm:block sm:col-span-2 text-center font-mono text-xs">
                      {formatCurrency(item.price)}
                    </div>

                    {/* Quantity modifier */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                      <span className="sm:hidden font-mono text-xs text-muted-foreground">Qty:</span>
                      <div className="flex items-center rounded-lg border border-brand-forest/20 bg-background font-mono text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-muted-foreground hover:text-brand-forest"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-muted-foreground hover:text-brand-forest"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="flex items-center justify-between sm:block sm:col-span-2 text-right">
                      <span className="sm:hidden font-mono text-xs text-muted-foreground">Total:</span>
                      <span className="font-mono text-sm font-bold text-brand-forest">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Bag & Continue Shopping */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/products">← Continue Exploring Catalog</Link>
                </Button>
                <Button
                  onClick={clearCart}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear Bag
                </Button>
              </div>
            </div>

            {/* Right: Order Summary Card */}
            <div className="lg:col-span-4 sticky top-24 space-y-6">
              <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-4">
                <h3 className="font-display text-xl font-bold text-brand-forest">
                  Order Summary
                </h3>

                <div className="divide-y divide-brand-forest/10 font-mono text-xs space-y-3 pt-2">
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-brand-forest">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between py-2 text-brand-olive font-semibold">
                      <span>Promo Savings ({discountPercentage}%)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Standard Delivery</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-brand-olive font-semibold">Free</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Estimated Tax</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="flex justify-between pt-3 text-base font-bold text-brand-forest">
                    <span>Estimated Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Promo code input */}
                <form onSubmit={handleApplyPromo} className="pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Promotional Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Try 'AURA10'"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="font-mono text-xs h-9 uppercase"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        isLoading={isApplying}
                        className="h-9 whitespace-nowrap text-xs"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  {promoCode && (
                    <div className="mt-2 flex items-center justify-between text-xs font-mono text-brand-olive">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>Code &quot;{promoCode}&quot; Active</span>
                      </span>
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="text-destructive hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Checkout CTA */}
                <Button
                  onClick={handleCheckoutPlaceholder}
                  size="lg"
                  className="w-full gap-2 mt-4"
                  variant="default"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Guarantees list */}
                <div className="space-y-2 pt-4 border-t border-brand-forest/10 text-[11px] text-muted-foreground font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-olive" />
                    <span>256-bit Encrypted SSL Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-brand-copper" />
                    <span>30-Day Effortless Returns</span>
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
