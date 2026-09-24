"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
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
  Check,
  Star,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/shared/product-card";
import { productService } from "@/services/product.service";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductReview, ProductVariantItem } from "@/types/catalog.types";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  // State
  const [product, setProduct] = React.useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>();
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>();
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariantItem | undefined>();
  const [quantity, setQuantity] = React.useState<number>(1);
  const [isAdding, setIsAdding] = React.useState<boolean>(false);

  // Review Dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState<boolean>(false);
  const [reviewRating, setReviewRating] = React.useState<number>(5);
  const [reviewTitle, setReviewTitle] = React.useState<string>("");
  const [reviewComment, setReviewComment] = React.useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = React.useState<boolean>(false);
  const [reviewError, setReviewError] = React.useState<string | null>(null);

  // Load product from Supabase
  React.useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setIsLoading(true);
      try {
        const prod = await productService.getProductBySlug(slug);
        if (!isCancelled) {
          if (prod) {
            setProduct(prod);
            setSelectedColor(prod.colors?.[0]?.name);
            setSelectedSize(prod.sizes?.[0]);
            if (prod.variants && prod.variants.length > 0) {
              setSelectedVariant(prod.variants[0]);
            }

            // Load related products
            const related = await productService.getProducts({
              category: prod.categorySlug,
              limit: 4,
            });
            setRelatedProducts(related.products.filter((p) => p.id !== prod.id).slice(0, 4));
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
        if (!isCancelled) setIsLoading(false);
      }
    }

    if (slug) {
      loadData();
    }

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pb-24 pt-8">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
            <div className="lg:col-span-7 aspect-square rounded-2xl bg-brand-forest/10" />
            <div className="lg:col-span-5 space-y-6 pt-4">
              <div className="h-4 w-28 bg-brand-forest/10 rounded" />
              <div className="h-8 w-3/4 bg-brand-forest/10 rounded" />
              <div className="h-6 w-32 bg-brand-forest/10 rounded" />
              <div className="h-20 w-full bg-brand-forest/10 rounded" />
              <div className="h-12 w-full bg-brand-forest/10 rounded" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const isFavorited = isInWishlist(product.id);

  // Dynamic price calculation based on variant
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const maxStock = Math.max(1, product.stockCount);

  // Handle color change
  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    // Find matching variant if exists
    if (product.variants) {
      const match = product.variants.find(
        (v) => v.options?.color?.toLowerCase() === colorName.toLowerCase()
      );
      if (match) setSelectedVariant(match);
    }
  };

  // Handle size change
  const handleSizeSelect = (sizeName: string) => {
    setSelectedSize(sizeName);
    if (product.variants) {
      const match = product.variants.find(
        (v) => v.options?.size?.toLowerCase() === sizeName.toLowerCase()
      );
      if (match) setSelectedVariant(match);
    }
  };

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
    }, 250);
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setIsSubmittingReview(true);

    const res = await productService.addReview({
      productId: product.id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
    });

    setIsSubmittingReview(false);

    if (!res.success) {
      setReviewError(res.error || "Failed to submit review");
      if (res.error?.includes("sign in")) {
        setTimeout(() => {
          router.push(`/login?redirectTo=/products/${product.slug}`);
        }, 1500);
      }
      return;
    }

    if (res.review) {
      setProduct((prev) => {
        if (!prev) return null;
        const updatedReviews = [res.review!, ...prev.reviews.filter((r) => r.id !== res.review!.id)];
        return {
          ...prev,
          reviews: updatedReviews,
          reviewsCount: updatedReviews.length,
        };
      });

      setIsReviewDialogOpen(false);
      setReviewTitle("");
      setReviewComment("");
      toast({
        title: "Review Published",
        description: "Thank you for sharing your experience with our artisan community.",
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
              { label: "Catalog", href: "/products" },
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

              {/* Verified Artisanal Tag */}
              <div className="absolute right-4 bottom-4">
                <span className="rounded-full bg-brand-forest/80 px-3 py-1 text-[11px] font-mono text-brand-cornsilk backdrop-blur-md shadow-sm">
                  {product.brandName}
                </span>
              </div>
            </div>

            {/* Thumbnail Selector Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      activeImageIndex === idx
                        ? "border-brand-olive ring-2 ring-brand-olive/30 shadow-sm"
                        : "border-brand-forest/15 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information & Purchase Panel */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <div>
              {/* Category & Brand Header */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                <Link
                  href={`/products?category=${product.categorySlug}`}
                  className="hover:text-brand-forest transition-colors"
                >
                  {product.category}
                </Link>
                <span className="text-brand-olive font-medium">By {product.brandName}</span>
              </div>

              {/* Product Title */}
              <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-normal leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews Header Link */}
              <div className="mt-3 flex items-center gap-3">
                <Rating value={product.rating} count={product.reviewsCount} size="md" />
                <span className="text-xs text-muted-foreground font-mono">
                  • {product.reviewsCount} verified reviews
                </span>
              </div>
            </div>

            {/* Price & Discount */}
            <div className="flex items-baseline gap-4 py-2 border-y border-brand-forest/10">
              <Price
                amount={currentPrice}
                compareAtAmount={currentCompareAtPrice}
                size="xl"
                showSavings
              />
              <span className="text-xs font-mono text-muted-foreground">
                Taxes calculated at checkout
              </span>
            </div>

            {/* Short Narrative Description */}
            <p className="text-sm text-brand-forest/80 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Stock Availability Pill */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  product.inStock ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                )}
              />
              <span className="text-xs font-mono font-medium text-brand-forest">
                {product.inStock
                  ? product.stockCount <= 8
                    ? `Low Stock — Only ${product.stockCount} handcrafted units left in studio`
                    : `In Stock in Atelier (${product.stockCount} available)`
                  : "Currently Out of Stock — Pre-orders opening soon"}
              </span>
            </div>

            {/* COLOR VARIANTS */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-wider text-brand-forest font-semibold">
                    Glaze & Finish:
                  </span>
                  <span className="font-medium text-brand-forest">{selectedColor}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleColorSelect(c.name)}
                        className={cn(
                          "relative h-9 w-9 rounded-full border-2 transition-all p-0.5",
                          isSelected
                            ? "border-brand-olive scale-110 shadow-sm"
                            : "border-transparent hover:scale-105"
                        )}
                        title={c.name}
                      >
                        <span
                          className="block h-full w-full rounded-full border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE VARIANTS */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-wider text-brand-forest font-semibold">
                    Dimensions / Proportion:
                  </span>
                  <span className="font-medium text-brand-forest">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleSizeSelect(s)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-mono transition-all",
                          isSelected
                            ? "border-brand-forest bg-brand-forest text-brand-cornsilk shadow-sm"
                            : "border-brand-forest/20 text-brand-forest hover:border-brand-forest"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY & ACTIONS */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                {/* Quantity Modifier */}
                <div className="flex items-center rounded-lg border border-brand-forest/20 bg-card p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !product.inStock}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center rounded text-brand-forest transition-colors hover:bg-brand-forest/10 disabled:opacity-30"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-semibold text-brand-forest">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    disabled={quantity >= maxStock || !product.inStock}
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center rounded text-brand-forest transition-colors hover:bg-brand-forest/10 disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <Button
                  size="lg"
                  disabled={!product.inStock || isAdding}
                  onClick={handleAddToCart}
                  className="flex-1 gap-2 bg-brand-forest text-brand-cornsilk hover:bg-brand-olive shadow-md"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {isAdding
                      ? "Placing in Bag..."
                      : !product.inStock
                      ? "Sold Out"
                      : `Add to Bag • $${(currentPrice * quantity).toFixed(2)}`}
                  </span>
                </Button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-forest/20 text-brand-forest transition-colors hover:bg-brand-forest/5 active:scale-95"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isFavorited
                        ? "fill-brand-copper text-brand-copper"
                        : "text-brand-forest hover:text-brand-copper"
                    )}
                  />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-brand-forest/20 text-brand-forest transition-colors hover:bg-brand-forest/5 active:scale-95"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Guarantees Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-brand-forest/10 text-center">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-brand-forest/5">
                  <Truck className="h-4 w-4 text-brand-olive" />
                  <span className="text-[10px] font-mono text-brand-forest font-medium">
                    Carbon-Neutral Shipping
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-brand-forest/5">
                  <Shield className="h-4 w-4 text-brand-olive" />
                  <span className="text-[10px] font-mono text-brand-forest font-medium">
                    Artisan Lifetime Pledge
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-brand-forest/5">
                  <RotateCcw className="h-4 w-4 text-brand-olive" />
                  <span className="text-[10px] font-mono text-brand-forest font-medium">
                    30-Day Mindful Returns
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABS: Specifications, Features, Care, and Real Customer Reviews */}
        <div className="mt-16 sm:mt-24 border-t border-brand-forest/10 pt-10">
          <Tabs defaultValue="specs">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-brand-forest/5 p-1 rounded-xl">
                <TabsTrigger value="specs" className="px-5 py-2">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="features" className="px-5 py-2">
                  Key Craft Highlights
                </TabsTrigger>
                <TabsTrigger value="care" className="px-5 py-2">
                  Care & Ritual
                </TabsTrigger>
                <TabsTrigger value="reviews" className="px-5 py-2">
                  Verified Reviews ({product.reviewsCount})
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
                  <span className="text-muted-foreground font-mono">SKU</span>
                  <span className="font-mono text-brand-forest text-right">{product.sku}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground font-mono">Atelier Brand</span>
                  <span className="font-medium text-brand-forest text-right">{product.brandName}</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-brand-forest/10 bg-card p-6 space-y-3">
                <h4 className="font-editorial text-xl font-normal text-brand-forest">
                  Key Craft Highlights
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm text-brand-forest/80 list-disc list-inside">
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="care" className="max-w-2xl mx-auto">
              <div className="rounded-xl border border-brand-forest/10 bg-card p-6 space-y-2 text-xs sm:text-sm">
                <h4 className="font-editorial text-xl font-normal text-brand-forest">
                  Preservation & Maintenance Ritual
                </h4>
                <p className="text-muted-foreground leading-relaxed">{product.care}</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {/* Header score & Write Review CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl border border-brand-forest/10 bg-card shadow-sm">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-editorial text-3xl font-bold text-brand-forest">
                        {Number(product.rating).toFixed(1)}
                      </h4>
                      <div className="space-y-0.5">
                        <Rating value={product.rating} size="md" />
                        <span className="text-xs font-mono text-muted-foreground block">
                          Based on {product.reviewsCount} customer experiences
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReviewDialogOpen(true)}
                    className="gap-2 border-brand-forest/20 text-brand-forest hover:bg-brand-forest/5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Write a Review</span>
                  </Button>
                </div>

                {/* Reviews List from Supabase */}
                {product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-6 rounded-xl border border-brand-forest/10 bg-card space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-brand-forest">
                              {rev.author}
                            </span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-mono text-emerald-800">
                                <Check className="h-3 w-3" />
                                Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{rev.date}</span>
                        </div>
                        <Rating value={rev.rating} size="sm" />
                        <h5 className="font-medium text-sm text-brand-forest">{rev.title}</h5>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-brand-forest/20 bg-card">
                    <p className="text-sm text-muted-foreground">
                      No reviews yet for this piece. Be the first to share your thoughts with our
                      community.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RELATED PRODUCTS FROM SUPABASE */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 sm:mt-28 border-t border-brand-forest/10 pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-accent text-sm text-brand-copper">
                  Curated From {product.category}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-light text-brand-forest">
                  Harmonious Complements
                </h3>
              </div>
              <Link
                href={`/products?category=${product.categorySlug}`}
                className="text-xs font-mono text-brand-olive hover:underline"
              >
                Explore Category →
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

      {/* Write a Review Modal */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Experience</DialogTitle>
            <DialogDescription>Reviewing {product.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
            {reviewError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 text-rose-800 text-xs">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{reviewError}</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-brand-forest font-semibold">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-brand-forest font-semibold">
                Review Headline
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sublime organic texture and weight"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="w-full rounded-lg border border-brand-forest/20 bg-background px-3 py-2 text-sm text-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-olive/30"
              />
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-brand-forest font-semibold">
                Your Reflections
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe the craft quality, packaging, and tactile experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-lg border border-brand-forest/20 bg-background px-3 py-2 text-sm text-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-olive/30 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-forest/10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingReview || !reviewTitle || !reviewComment}
                className="bg-brand-forest text-brand-cornsilk hover:bg-brand-olive"
              >
                {isSubmittingReview ? "Publishing..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
