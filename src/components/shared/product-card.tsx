"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/mock-data";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const isFavorited = isInWishlist(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = await toggleWishlist(product);
    toast({
      title: added ? "Saved to wishlist" : "Removed from wishlist",
      description: `${product.name} has been ${added ? "added to" : "removed from"} your saved items.`,
      variant: "wishlist",
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      product,
      1,
      product.colors?.[0]?.name,
      product.sizes?.[0]
    );
    toast({
      title: "Added to shopping bag",
      description: `${product.name} (1 item)`,
      variant: "cart",
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-brand-forest/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      {/* Visual Image Container */}
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
          priority={priority}
        />

        {/* Badge Indicator */}
        {product.badge && (
          <div className="absolute left-3 top-3 z-10">
            <Badge
              variant={
                product.badge === "Sale"
                  ? "copper"
                  : product.badge === "New"
                  ? "forest"
                  : product.badge === "Bestseller"
                  ? "secondary"
                  : "default"
              }
              className="text-[10px] tracking-wider uppercase"
            >
              {product.badge}
            </Badge>
          </div>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlistClick}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card/85 text-brand-forest backdrop-blur-md transition-all hover:bg-card hover:scale-110 active:scale-95 shadow-sm"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorited
                ? "fill-brand-copper text-brand-copper"
                : "text-brand-forest/70 hover:text-brand-copper"
            )}
          />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:block opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-forest/90 py-2.5 text-xs font-medium text-brand-cornsilk backdrop-blur-md transition-colors hover:bg-brand-olive active:scale-[0.98] shadow-md"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Quick Add</span>
          </button>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category Label */}
        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
          <span>{product.category}</span>
          {product.stockCount <= 8 && (
            <span className="text-brand-copper font-medium">Only {product.stockCount} left</span>
          )}
        </div>

        {/* Product Title */}
        <Link
          href={`/products/${product.slug}`}
          className="font-medium text-sm text-brand-forest transition-colors hover:text-brand-olive line-clamp-1 mb-2"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-2">
          <Rating value={product.rating} count={product.reviewsCount} size="sm" />
        </div>

        {/* Price & Mobile Add Button */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <Price
            amount={product.price}
            compareAtAmount={product.compareAtPrice}
            size="md"
            showSavings
          />

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            aria-label="Add to bag"
            className="flex sm:hidden h-8 w-8 items-center justify-center rounded-full bg-brand-olive text-brand-cornsilk shadow-sm active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
