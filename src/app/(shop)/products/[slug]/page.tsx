"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Shield,
  Plus,
  Minus,
  Sparkles,
  Share2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductCard } from "@/components/shared/product-card";
import { CanvasContainer } from "@/components/3d/canvas-container";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useToast } from "@/hooks/use-toast";
import { PRODUCTS, type Product } from "@/data/mock-data";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const product = PRODUCTS.find((p) => p.slug === slug);

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(
    product?.colors?.[0]?.name
  );
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(
    product?.sizes?.[0]
  );
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  if (!product) {
    return notFound();
  }

  const isFavorited = isInWishlist(product.id);

  // Related products
  const relatedProducts = PRODUCTS.filter(
    (p) => p.categorySlug === product.categorySlug && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product, quantity, selectedColor, selectedSize);

    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Added to shopping bag",
        description: `${quantity}x ${product.name} (${selectedColor || "Standard"}${
          selectedSize ? ` / ${selectedSize}` : ""
        })`,
        variant: "cart",
      });
    }, 300);
  };

  const handleWishlistToggle = () => {
    const added = toggleWishlist(product);
    toast({
      title: added ? "Saved to wishlist" : "Removed from wishlist",
      description: `${product.name} has been ${added ? "added to" : "removed from"} your saved collection.`,
      variant: "wishlist",
    });
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "Share this mindful object with loved ones.",
      });
    }
  };

  return (
    <div className="pb-24">
      {/* Breadcrumb Bar */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-4">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Products", href: "/products" },
              { label: product.category, href: `/products?category=${product.categorySlug}` },
              { label: product.name },
            ]}
          />
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Multi-image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage View */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-brand-forest/15 bg-brand-forest/5 shadow-sm">
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-all duration-500"
              />

              {/* Badges */}
              {product.badge && (
                <div className="absolute left-4 top-4">
                  <Badge variant="secondary" className="px-3 py-1 font-mono uppercase text-xs">
                    {product.badge}
                  </Badge>
                </div>
              )}

              {/* 3D readiness visual tag */}
              <div className="absolute right-4 bottom-4">
                <span className="rounded-full bg-brand-forest/80 px-3 py-1 text-[11px] font-mono text-brand-cornsilk backdrop-blur-md shadow-sm">
                  Artisanal Scale 1:1
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-brand-olive scale-95 shadow-sm"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} preview ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Meta & Purchase Controls */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                <span>{product.category}</span>
                <span className="text-[11px]">SKU: {product.sku}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-forest leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3 mt-3">
                <Rating value={product.rating} count={product.reviewsCount} size="md" />
                <span className="text-xs text-brand-olive font-mono">
                  {product.inStock ? "• In Stock Ready to Ship" : "• Made to Order"}
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 pt-4 border-t border-brand-forest/10">
                <Price
                  amount={product.price}
                  compareAtAmount={product.compareAtPrice}
                  size="xl"
                  showSavings
                />
              </div>

              <p className="mt-4 text-sm text-brand-forest/80 leading-relaxed font-sans">
                {product.description}
              </p>
            </div>

            {/* Color Swatches (if available) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-forest/10">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-brand-forest">Color Shade:</span>
                  <span className="font-mono text-muted-foreground">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`h-8 w-8 rounded-full border-2 transition-transform ${
                        selectedColor === c.name
                          ? "border-brand-forest scale-110 shadow-sm"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Pills (if available) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-brand-forest">Select Dimension:</span>
                  <span className="font-mono text-muted-foreground">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`rounded-lg px-3.5 py-1.5 font-mono text-xs transition-all ${
                        selectedSize === s
                          ? "bg-brand-forest text-brand-cornsilk font-semibold shadow-sm"
                          : "border border-brand-forest/15 hover:bg-brand-forest/5"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-4 border-t border-brand-forest/10">
              <div className="flex items-center gap-3">
                {/* Quantity modifier */}
                <div className="flex items-center rounded-lg border border-brand-forest/20 bg-background font-mono text-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-muted-foreground hover:text-brand-forest"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-muted-foreground hover:text-brand-forest"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  isLoading={isAdding}
                  size="lg"
                  className="flex-1 gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Shopping Bag</span>
                </Button>

                {/* Wishlist Heart Toggle */}
                <Button
                  onClick={handleWishlistToggle}
                  variant="outline"
                  size="lg"
                  className="px-3.5"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorited ? "fill-brand-copper text-brand-copper" : "text-brand-forest"
                    }`}
                  />
                </Button>

                {/* Share Button */}
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="lg"
                  className="px-3"
                  aria-label="Share product"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-brand-forest/10 bg-brand-forest/5 p-4 text-center text-[11px] text-muted-foreground">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-brand-olive" />
                <span>Complimentary Delivery &gt; $100</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="h-4 w-4 text-brand-copper" />
                <span>30-Day Ritual Trial</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4 text-brand-olive" />
                <span>Artisan Lifetime Care</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS ACCORDION / TABS */}
        <div className="mt-16 sm:mt-24 border-t border-brand-forest/10 pt-12">
          <Tabs defaultValue="specs">
            <div className="flex justify-center mb-8">
              <TabsList className="h-auto p-1.5 bg-brand-forest/5 rounded-xl">
                <TabsTrigger value="specs" className="px-5 py-2">
                  Materials & Dimensions
                </TabsTrigger>
                <TabsTrigger value="features" className="px-5 py-2">
                  Artisanal Craft
                </TabsTrigger>
                <TabsTrigger value="care" className="px-5 py-2">
                  Care Guide
                </TabsTrigger>
                <TabsTrigger value="reviews" className="px-5 py-2">
                  Reviews ({product.reviewsCount})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="specs" className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-brand-forest/10 bg-card p-6 divide-y divide-brand-forest/10 text-xs sm:text-sm">
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground font-mono">Materials</span>
                  <span className="font-medium text-brand-forest text-right">{product.materials}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground font-mono">Dimensions</span>
                  <span className="font-medium text-brand-forest text-right">{product.dimensions}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground font-mono">Origin</span>
                  <span className="font-medium text-brand-forest text-right">Handcrafted in Kyoto, Japan</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-brand-forest/10 bg-card p-6 space-y-3">
                <h4 className="font-display text-lg font-bold text-brand-forest">
                  Key Craft Highlights
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-brand-forest/80 list-disc list-inside">
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="care" className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-brand-forest/10 bg-card p-6 space-y-2 text-xs sm:text-sm">
                <h4 className="font-display text-lg font-bold text-brand-forest">
                  Preservation & Maintenance
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.care}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="max-w-3xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 rounded-xl border border-brand-forest/10 bg-card">
                  <div>
                    <h4 className="font-display text-2xl font-bold text-brand-forest">
                      {product.rating.toFixed(1)} out of 5
                    </h4>
                    <Rating value={product.rating} count={product.reviewsCount} size="md" className="mt-1" />
                  </div>
                  <Button variant="outline" size="sm">
                    Write a Review
                  </Button>
                </div>

                {product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-6 rounded-xl border border-brand-forest/10 bg-card space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-brand-forest">{rev.author}</span>
                          <span className="font-mono text-xs text-muted-foreground">{rev.date}</span>
                        </div>
                        <Rating value={rev.rating} size="sm" />
                        <h5 className="font-medium text-sm text-brand-forest">{rev.title}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-xs font-mono text-muted-foreground">
                    Be the first to share your experience with this object.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 sm:mt-28 border-t border-brand-forest/10 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-accent text-sm text-brand-copper">Harmonious Additions</span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-brand-forest">
                  You May Also Cherish
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-mono text-brand-olive hover:underline"
              >
                View Full Collection →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
