"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ArrowRight, Trash2, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const { items, isLoading, init, removeFromWishlist, moveToCart, clearWishlist } = useWishlistStore();
  const { toast } = useToast();
  const [mounted, setMounted] = React.useState(false);
  const [movingId, setMovingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    init();
  }, [init]);

  const handleMoveToBag = async (product: any) => {
    setMovingId(product.id);
    const res = await moveToCart(
      product,
      1,
      product.colors?.[0]?.name,
      product.sizes?.[0]
    );
    setMovingId(null);

    if (res.success) {
      toast({
        title: "Moved to shopping bag",
        description: `${product.name} moved to your bag.`,
        variant: "cart",
      });
    } else {
      toast({
        title: "Stock Alert",
        description: res.message || "Cannot move to bag at this time.",
        variant: "destructive",
      });
    }
  };

  const handleMoveAllToBag = async () => {
    const list = [...items];
    let successCount = 0;

    for (const p of list) {
      const res = await moveToCart(p, 1, p.colors?.[0]?.name, p.sizes?.[0]);
      if (res.success) successCount++;
    }

    toast({
      title: "Wishlist moved to bag",
      description: `${successCount} items moved to your shopping bag.`,
      variant: "cart",
    });
  };

  if (!mounted || isLoading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-olive border-t-transparent" />
          <p className="font-mono text-xs text-muted-foreground">
            Loading your sanctuary wishlist...
          </p>
        </div>
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
              <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-light">
                Things You Love
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-mono">
                {items.length === 1 ? "1 saved object" : `${items.length} saved objects`} in your sanctuary collection
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <Button onClick={handleMoveAllToBag} variant="default" size="sm" className="gap-2 bg-brand-forest text-brand-cornsilk hover:bg-brand-olive">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Move All to Bag</span>
                </Button>
                <Button
                  onClick={() => clearWishlist()}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
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
              <div
                key={product.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-brand-forest/10 bg-card transition-all duration-300 hover:shadow-md"
              >
                {/* Visual Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative aspect-square w-full overflow-hidden bg-brand-forest/5"
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {product.badge && (
                    <div className="absolute left-3 top-3 z-10">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {product.badge}
                      </Badge>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                      toast({
                        title: "Removed from wishlist",
                        description: `${product.name} removed.`,
                        variant: "wishlist",
                      });
                    }}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-brand-copper shadow-sm hover:scale-110 active:scale-95 transition-transform"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                    <span>{product.category}</span>
                    <span className="text-emerald-700 font-medium">
                      {product.inStock ? "In stock" : "Sold out"}
                    </span>
                  </div>

                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium text-sm text-brand-forest transition-colors hover:text-brand-olive line-clamp-1 mb-2"
                  >
                    {product.name}
                  </Link>

                  <div className="mb-3">
                    <Rating value={product.rating} count={product.reviewsCount} size="sm" />
                  </div>

                  <div className="flex items-center justify-between pt-1 mb-3">
                    <Price
                      amount={product.price}
                      compareAtAmount={product.compareAtPrice}
                      size="md"
                      showSavings
                    />
                  </div>

                  {/* Move to Bag Action Button */}
                  <Button
                    onClick={() => handleMoveToBag(product)}
                    disabled={!product.inStock || movingId === product.id}
                    size="sm"
                    className="w-full gap-2 mt-auto bg-brand-forest text-brand-cornsilk hover:bg-brand-olive text-xs"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>
                      {movingId === product.id
                        ? "Moving..."
                        : !product.inStock
                        ? "Out of Stock"
                        : "Move to Bag"}
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
