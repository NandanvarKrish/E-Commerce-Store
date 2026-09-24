"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddAllToBag = () => {
    items.forEach((product) => {
      addItem(product, 1, product.colors?.[0]?.name, product.sizes?.[0]);
    });
    toast({
      title: "All saved items added to bag",
      description: `${items.length} items moved to your shopping bag.`,
      variant: "cart",
    });
  };

  if (!mounted) {
    return (
      <Container className="py-16 text-center">
        <p className="font-mono text-xs text-muted-foreground">Loading your sanctuary wishlist...</p>
      </Container>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Wishlist" }]} className="mb-2" />
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-accent text-sm text-brand-copper">Personal Collection</span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-forest">
                Things You Love
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {items.length === 1 ? "1 saved object" : `${items.length} saved objects`} for your sanctuary
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <Button onClick={handleAddAllToBag} variant="default" size="sm" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add All to Bag</span>
                </Button>
                <Button
                  onClick={clearWishlist}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Wishlist</span>
                </Button>
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Grid */}
      <Container className="pt-8 sm:pt-12">
        {items.length === 0 ? (
          <EmptyState
            title="Your wishlist is empty"
            description="You haven't saved any treasures to your collection yet. Tap the heart icon on any product to save it here for later."
            actionLabel="Explore Collections"
            onAction={() => (window.location.href = "/products")}
            icon={<Heart className="h-6 w-6 text-brand-copper" />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
