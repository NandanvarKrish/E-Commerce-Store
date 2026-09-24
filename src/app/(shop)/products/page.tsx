"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { PRODUCTS, CATEGORIES } from "@/data/mock-data";

export default function ShopProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  // State
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [priceRange, setPriceRange] = React.useState<number>(300);
  const [inStockOnly, setInStockOnly] = React.useState<boolean>(false);
  const [minRating, setMinRating] = React.useState<number>(0);
  const [sortBy, setSortBy] = React.useState<string>("featured");
  const [isFilterDrawerOpen, setFilterDrawerOpen] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Keep state in sync with URL category param if it changes
  React.useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  // Filter products
  const filteredProducts = PRODUCTS.filter((product) => {
    if (initialQuery) {
      const match =
        product.name.toLowerCase().includes(initialQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(initialQuery.toLowerCase()) ||
        product.tags.some((t) => t.toLowerCase().includes(initialQuery.toLowerCase()));
      if (!match) return false;
    }

    if (selectedCategory !== "all" && product.categorySlug !== selectedCategory) {
      return false;
    }

    if (product.price > priceRange) {
      return false;
    }

    if (inStockOnly && !product.inStock) {
      return false;
    }

    if (minRating > 0 && product.rating < minRating) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "newest") return (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0);
    return 0; // featured default
  });

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange(300);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedCategory !== "all" || priceRange < 300 || inStockOnly || minRating > 0;

  // Filter controls component
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Category
        </h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2.5 cursor-pointer text-brand-forest hover:text-brand-olive transition-colors">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === "all"}
              onChange={() => setSelectedCategory("all")}
              className="accent-brand-olive h-4 w-4"
            />
            <span className="flex-1 font-medium">All Collections</span>
            <span className="font-mono text-xs text-muted-foreground">({PRODUCTS.length})</span>
          </label>

          {CATEGORIES.map((cat) => {
            const count = PRODUCTS.filter((p) => p.categorySlug === cat.slug).length;
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer text-brand-forest hover:text-brand-olive transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.slug}
                  onChange={() => setSelectedCategory(cat.slug)}
                  className="accent-brand-olive h-4 w-4"
                />
                <span className="flex-1">{cat.name}</span>
                <span className="font-mono text-xs text-muted-foreground">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
            Max Price
          </h3>
          <span className="font-mono text-xs font-bold text-brand-forest">
            ${priceRange}
          </span>
        </div>
        <input
          type="range"
          min="30"
          max="300"
          step="10"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-brand-olive h-1.5 bg-brand-forest/10 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>$30</span>
          <span>$300</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Minimum Rating
        </h3>
        <div className="space-y-1.5 text-xs">
          {[
            { label: "Any Rating", val: 0 },
            { label: "4.5★ & higher", val: 4.5 },
            { label: "4.8★ & higher", val: 4.8 },
          ].map((r) => (
            <label
              key={r.val}
              className="flex items-center gap-2 cursor-pointer text-brand-forest hover:text-brand-olive"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === r.val}
                onChange={() => setMinRating(r.val)}
                className="accent-brand-olive h-3.5 w-3.5"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-brand-forest">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-brand-olive h-4 w-4 rounded"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {hasActiveFilters && (
        <Button
          onClick={resetFilters}
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs font-mono"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All Filters</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className="pb-20">
      {/* Top Banner / Breadcrumbs */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/50 py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Products" }]} className="mb-3" />
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-forest">
                {selectedCategory === "all"
                  ? "Mindful Living Catalog"
                  : CATEGORIES.find((c) => c.slug === selectedCategory)?.name || "Collection"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Showing {sortedProducts.length} thoughtfully crafted artisanal essentials
              </p>
            </div>

            {/* Mobile Filter Button */}
            <Button
              onClick={() => setFilterDrawerOpen(true)}
              variant="outline"
              size="sm"
              className="lg:hidden gap-2 self-start font-mono text-xs"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters {hasActiveFilters && "(Active)"}</span>
            </Button>
          </div>
        </Container>
      </div>

      {/* Main Body */}
      <Container className="pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-brand-forest/10 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-brand-forest/10 mb-4">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-brand-forest flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Refine Catalog</span>
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="font-mono text-[11px] text-brand-copper hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FilterControls />
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-forest/10">
              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedCategory !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-olive/15 px-3 py-1 font-mono text-xs text-brand-forest">
                    {CATEGORIES.find((c) => c.slug === selectedCategory)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-brand-copper"
                      onClick={() => setSelectedCategory("all")}
                    />
                  </span>
                )}
                {priceRange < 300 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-clay/20 px-3 py-1 font-mono text-xs text-brand-forest">
                    Under ${priceRange}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-brand-copper"
                      onClick={() => setPriceRange(300)}
                    />
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-forest/10 px-3 py-1 font-mono text-xs text-brand-forest">
                    In Stock Only
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-brand-copper"
                      onClick={() => setInStockOnly(false)}
                    />
                  </span>
                )}
              </div>

              {/* Sort & View Toggle */}
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline font-mono text-xs text-muted-foreground">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-md border border-brand-forest/20 bg-card px-2.5 py-1.5 font-mono text-xs text-brand-forest focus:outline-none focus:ring-1 focus:ring-brand-olive"
                  >
                    <option value="featured">Featured Collection</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center rounded-md border border-brand-forest/20 p-0.5 bg-card">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded ${
                      viewMode === "grid" ? "bg-brand-forest/10 text-brand-forest" : "text-muted-foreground"
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded ${
                      viewMode === "list" ? "bg-brand-forest/10 text-brand-forest" : "text-muted-foreground"
                    }`}
                    aria-label="List view"
                  >
                    <LayoutList className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Results */}
            {sortedProducts.length === 0 ? (
              <EmptyState
                title="No matching objects found"
                description="We couldn't find items that match your chosen filters. Try widening your price range or exploring all collections."
                actionLabel="Reset All Filters"
                onAction={resetFilters}
              />
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-brand-forest/10 bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square w-full sm:w-44 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="176px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          {product.category}
                        </span>
                        <h3 className="font-display text-lg font-bold text-brand-forest mt-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-forest/10">
                        <span className="font-mono text-base font-bold text-brand-forest">
                          ${product.price}.00
                        </span>
                        <Button size="sm" asChild>
                          <a href={`/products/${product.slug}`}>View Details</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile Filter Drawer */}
      <Drawer
        open={isFilterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        position="bottom"
      >
        <DrawerHeader onClose={() => setFilterDrawerOpen(false)}>
          <h2 className="font-display text-lg font-bold text-brand-forest">
            Filter Catalog
          </h2>
        </DrawerHeader>
        <DrawerContent className="p-6">
          <FilterControls />
        </DrawerContent>
        <DrawerFooter>
          <Button
            onClick={() => setFilterDrawerOpen(false)}
            className="w-full"
            variant="default"
          >
            Apply Filters ({sortedProducts.length} Results)
          </Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}
