"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  X,
  RotateCcw,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Heart,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/shared/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from "@/components/ui/drawer";
import { productService } from "@/services/product.service";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category, Brand } from "@/types/catalog.types";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export default function ShopProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters
  const initialCategory = searchParams.get("category") || "all";
  const initialBrand = searchParams.get("brand") || "all";
  const initialQuery = searchParams.get("q") || "";
  const initialMaxPrice = Number(searchParams.get("maxPrice")) || 350;
  const initialInStock = searchParams.get("inStock") === "true";
  const initialSort = (searchParams.get("sort") as any) || "featured";
  const initialPage = Number(searchParams.get("page")) || 1;

  // State
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = React.useState<string>(initialBrand);
  const [searchQuery, setSearchQuery] = React.useState<string>(initialQuery);
  const [priceRange, setPriceRange] = React.useState<number>(initialMaxPrice);
  const [inStockOnly, setInStockOnly] = React.useState<boolean>(initialInStock);
  const [minRating, setMinRating] = React.useState<number>(0);
  const [sortBy, setSortBy] = React.useState<"featured" | "price-asc" | "price-desc" | "rating" | "newest">(initialSort);
  const [currentPage, setCurrentPage] = React.useState<number>(initialPage);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [isFilterDrawerOpen, setFilterDrawerOpen] = React.useState<boolean>(false);

  // Data from Supabase
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Stores
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  // Load Categories & Brands from Supabase on mount
  React.useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error("Failed to load catalog metadata:", err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products from Supabase whenever filters change
  React.useEffect(() => {
    let isCancelled = false;

    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await productService.getProducts({
          category: selectedCategory,
          brand: selectedBrand,
          search: searchQuery,
          maxPrice: priceRange,
          inStockOnly,
          minRating,
          sortBy,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (!isCancelled) {
          setProducts(res.products);
          setTotalItems(res.total);
          setTotalPages(res.totalPages);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching catalog products:", err);
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [
    selectedCategory,
    selectedBrand,
    searchQuery,
    priceRange,
    inStockOnly,
    minRating,
    sortBy,
    currentPage,
  ]);

  // Sync state back to URL for bookmarkable filters
  const updateUrl = React.useCallback(
    (params: Record<string, string | number | boolean | null>) => {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([k, v]) => {
        if (v === null || v === "" || v === "all" || v === false || (k === "page" && v === 1)) {
          url.searchParams.delete(k);
        } else {
          url.searchParams.set(k, String(v));
        }
      });
      router.replace(url.pathname + url.search, { scroll: false });
    },
    [router]
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    updateUrl({ category: cat, page: 1 });
  };

  const handleBrandChange = (br: string) => {
    setSelectedBrand(br);
    setCurrentPage(1);
    updateUrl({ brand: br, page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrl({ q: searchQuery, page: 1 });
  };

  const handleSortChange = (newSort: "featured" | "price-asc" | "price-desc" | "rating" | "newest") => {
    setSortBy(newSort);
    setCurrentPage(1);
    updateUrl({ sort: newSort, page: 1 });
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSearchQuery("");
    setPriceRange(350);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy("featured");
    setCurrentPage(1);
    router.replace("/products");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedBrand !== "all" ||
    searchQuery.trim() !== "" ||
    priceRange < 350 ||
    inStockOnly ||
    minRating > 0;

  // Filter controls sidebar / drawer
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Collections
        </h3>
        <div className="space-y-1.5 text-sm">
          <label className="flex items-center gap-2.5 cursor-pointer py-1 text-brand-forest hover:text-brand-olive transition-colors">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === "all"}
              onChange={() => handleCategoryChange("all")}
              className="accent-brand-olive h-4 w-4"
            />
            <span className="flex-1 font-medium">All Collections</span>
          </label>

          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer py-1 text-brand-forest hover:text-brand-olive transition-colors"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => handleCategoryChange(cat.slug)}
                className="accent-brand-olive h-4 w-4"
              />
              <span className="flex-1">{cat.name}</span>
              {cat.itemCount > 0 && (
                <span className="font-mono text-xs text-muted-foreground">({cat.itemCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Artisan Studios & Brands
        </h3>
        <div className="space-y-1.5 text-sm">
          <label className="flex items-center gap-2.5 cursor-pointer py-1 text-brand-forest hover:text-brand-olive transition-colors">
            <input
              type="radio"
              name="brand"
              checked={selectedBrand === "all"}
              onChange={() => handleBrandChange("all")}
              className="accent-brand-olive h-4 w-4"
            />
            <span className="flex-1 font-medium">All Studios</span>
          </label>

          {brands.map((br) => (
            <label
              key={br.id}
              className="flex items-center gap-2.5 cursor-pointer py-1 text-brand-forest hover:text-brand-olive transition-colors"
            >
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === br.slug}
                onChange={() => handleBrandChange(br.slug)}
                className="accent-brand-olive h-4 w-4"
              />
              <span className="flex-1">{br.name}</span>
              {br.itemCount !== undefined && br.itemCount > 0 && (
                <span className="font-mono text-xs text-muted-foreground">({br.itemCount})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
            Max Price
          </h3>
          <span className="font-mono text-xs font-bold text-brand-forest">${priceRange}</span>
        </div>
        <input
          type="range"
          min="30"
          max="350"
          step="10"
          value={priceRange}
          onChange={(e) => {
            const val = Number(e.target.value);
            setPriceRange(val);
            setCurrentPage(1);
            updateUrl({ maxPrice: val, page: 1 });
          }}
          className="w-full accent-brand-olive h-2 bg-brand-forest/10 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
          <span>$30</span>
          <span>$350</span>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-brand-forest hover:text-brand-olive transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setCurrentPage(1);
              updateUrl({ inStock: e.target.checked, page: 1 });
            }}
            className="accent-brand-olive h-4 w-4 rounded"
          />
          <span>In Stock in Studio Only</span>
        </label>
      </div>

      {/* Min Rating */}
      <div className="space-y-3 pt-4 border-t border-brand-forest/10">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-forest">
          Customer Rating
        </h3>
        <div className="space-y-1.5 text-sm">
          {[
            { label: "All Ratings", val: 0 },
            { label: "4.8 & Above", val: 4.8 },
            { label: "4.5 & Above", val: 4.5 },
            { label: "4.0 & Above", val: 4.0 },
          ].map((r) => (
            <label
              key={r.val}
              className="flex items-center gap-2.5 cursor-pointer py-1 text-brand-forest hover:text-brand-olive transition-colors"
            >
              <input
                type="radio"
                name="rating"
                checked={minRating === r.val}
                onChange={() => {
                  setMinRating(r.val);
                  setCurrentPage(1);
                }}
                className="accent-brand-olive h-4 w-4"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-brand-forest/10">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="w-full gap-2 text-xs border-brand-forest/20 text-brand-forest hover:bg-brand-forest/5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-24">
      {/* Editorial Header */}
      <section className="relative overflow-hidden bg-brand-forest text-brand-cornsilk py-12 md:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#dda15e_1px,transparent_1px)] [background-size:16px_16px]" />
        <Container className="relative z-10">
          <div className="max-w-3xl space-y-4">
            <Breadcrumbs
              items={[
                { label: "Catalog", href: "/products" },
                ...(selectedCategory !== "all"
                  ? [
                      {
                        label:
                          categories.find((c) => c.slug === selectedCategory)?.name ||
                          selectedCategory,
                        href: `/products?category=${selectedCategory}`,
                      },
                    ]
                  : []),
              ]}
              className="mb-2 text-brand-cornsilk/60 hover:text-brand-cornsilk"
            />
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-olive/30 px-3 py-1 text-xs text-brand-clay font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Supabase Catalog</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-brand-cornsilk">
              Mindful Creations for Intentional Living
            </h1>
            <p className="text-sm sm:text-base text-brand-cornsilk/80 max-w-2xl leading-relaxed">
              Every artifact is responsibly sourced, wheel-thrown, hand-woven, or carved by
              independent master artisans across Portugal, Kyoto, and the Mediterranean.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Catalog Viewport */}
      <Container className="pt-8 sm:pt-12">
        {/* Search & Top Action Bar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-brand-forest/10">
          {/* Live Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md flex items-center"
          >
            <Search className="absolute left-3.5 h-4 w-4 text-brand-forest/50" />
            <input
              type="text"
              placeholder="Search by material, finish, or studio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-lg border border-brand-forest/20 bg-card text-sm text-brand-forest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-olive/30 focus:border-brand-olive transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                  updateUrl({ q: null, page: 1 });
                }}
                className="absolute right-3 text-muted-foreground hover:text-brand-forest"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Right Controls: Sort & Mode & Mobile Filters Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {/* Mobile Filter Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 border-brand-forest/20 text-brand-forest text-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-brand-copper" />
              )}
            </Button>

            {/* Sorting Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                aria-label="Sort products"
                className="h-9 rounded-lg border border-brand-forest/20 bg-card px-3 text-xs font-medium text-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-olive/30 transition-all cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Studio Additions</option>
              </select>
            </div>

            {/* Grid / List Mode */}
            <div className="hidden sm:flex items-center rounded-lg border border-brand-forest/15 bg-brand-forest/5 p-1">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === "grid"
                    ? "bg-card text-brand-forest shadow-sm"
                    : "text-muted-foreground hover:text-brand-forest"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={cn(
                  "p-1.5 rounded transition-colors",
                  viewMode === "list"
                    ? "bg-card text-brand-forest shadow-sm"
                    : "text-muted-foreground hover:text-brand-forest"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Active:</span>

            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-olive/10 px-3 py-1 text-xs text-brand-forest">
                <span>
                  {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="hover:text-brand-copper"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedBrand !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-clay/20 px-3 py-1 text-xs text-brand-forest">
                <span>Studio: {brands.find((b) => b.slug === selectedBrand)?.name || selectedBrand}</span>
                <button
                  onClick={() => handleBrandChange("all")}
                  className="hover:text-brand-copper"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest/10 px-3 py-1 text-xs text-brand-forest">
                <span>Query: &quot;{searchQuery}&quot;</span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    updateUrl({ q: null });
                  }}
                  className="hover:text-brand-copper"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {priceRange < 350 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-forest/10 px-3 py-1 text-xs text-brand-forest">
                <span>Under ${priceRange}</span>
                <button
                  onClick={() => {
                    setPriceRange(350);
                    updateUrl({ maxPrice: null });
                  }}
                  className="hover:text-brand-copper"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-900 px-3 py-1 text-xs">
                <span>In Stock Only</span>
                <button
                  onClick={() => {
                    setInStockOnly(false);
                    updateUrl({ inStock: null });
                  }}
                  className="hover:text-emerald-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs text-brand-copper hover:underline font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-brand-forest/10 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-brand-forest/10 mb-4">
                <span className="font-editorial text-lg text-brand-forest">Filter Catalog</span>
                <span className="text-xs font-mono text-muted-foreground">{totalItems} found</span>
              </div>
              <FilterControls />
            </div>
          </aside>

          {/* Product Feed & Pagination */}
          <main className="lg:col-span-3">
            {isLoading ? (
              // Skeletons
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col rounded-xl border border-brand-forest/10 overflow-hidden bg-card animate-pulse"
                  >
                    <div className="aspect-square w-full bg-brand-forest/5" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-20 bg-brand-forest/10 rounded" />
                      <div className="h-4 w-3/4 bg-brand-forest/10 rounded" />
                      <div className="h-3 w-1/2 bg-brand-forest/10 rounded" />
                      <div className="h-5 w-24 bg-brand-forest/10 rounded pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              // Empty State
              <EmptyState
                icon={<SlidersHorizontal className="h-6 w-6" />}
                title="No Mindful Objects Found"
                description="We couldn't find any artisanal objects matching your selected filters. Try broadening your criteria or reset the search."
                actionLabel="Clear All Filters"
                onAction={resetFilters}
              />
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {products.map((product) => {
                  const isFavorited = isInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-brand-forest/10 bg-card hover:shadow-md transition-all duration-300"
                    >
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative w-full sm:w-56 aspect-square sm:aspect-auto overflow-hidden bg-brand-forest/5 flex-shrink-0"
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 224px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.badge && (
                          <div className="absolute left-3 top-3">
                            <Badge variant="copper" className="text-[10px] uppercase">
                              {product.badge}
                            </Badge>
                          </div>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col justify-between p-5">
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono uppercase text-muted-foreground mb-1">
                            <span>{product.category}</span>
                            <span className="text-brand-olive font-medium">
                              {product.brandName}
                            </span>
                          </div>

                          <Link
                            href={`/products/${product.slug}`}
                            className="font-medium text-lg text-brand-forest hover:text-brand-olive transition-colors mb-2 block"
                          >
                            {product.name}
                          </Link>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {product.description}
                          </p>

                          <div className="mb-3">
                            <Rating value={product.rating} count={product.reviewsCount} size="sm" />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-brand-forest/10 flex items-center justify-between">
                          <div>
                            <Price
                              amount={product.price}
                              compareAtAmount={product.compareAtPrice}
                              size="lg"
                              showSavings
                            />
                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {product.inStock
                                ? `In stock (${product.stockCount} available)`
                                : "Out of stock"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const added = await toggleWishlist(product);
                                toast({
                                  title: added ? "Saved to wishlist" : "Removed from wishlist",
                                  description: `${product.name} saved.`,
                                  variant: "wishlist",
                                });
                              }}
                              className="p-2 rounded-lg border border-brand-forest/15 hover:bg-brand-forest/5 text-brand-forest transition-colors"
                              aria-label="Wishlist"
                            >
                              <Heart
                                className={cn(
                                  "h-4 w-4",
                                  isFavorited && "fill-brand-copper text-brand-copper"
                                )}
                              />
                            </button>

                            <Button
                              size="sm"
                              onClick={() => {
                                addItem(
                                  product,
                                  1,
                                  product.colors?.[0]?.name,
                                  product.sizes?.[0]
                                );
                                toast({
                                  title: "Added to shopping bag",
                                  description: `${product.name} added.`,
                                  variant: "cart",
                                });
                              }}
                              className="gap-2 bg-brand-forest text-brand-cornsilk hover:bg-brand-olive text-xs"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Add to Bag</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-brand-forest/10">
                <span className="text-xs font-mono text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} mindful objects
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => {
                      const next = currentPage - 1;
                      setCurrentPage(next);
                      updateUrl({ page: next });
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className="h-8 px-2.5 text-xs border-brand-forest/20 text-brand-forest disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                  </Button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          updateUrl({ page: pageNum });
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-mono transition-colors",
                          isActive
                            ? "bg-brand-forest text-brand-cornsilk font-bold"
                            : "hover:bg-brand-forest/10 text-brand-forest"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      const next = currentPage + 1;
                      setCurrentPage(next);
                      updateUrl({ page: next });
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className="h-8 px-2.5 text-xs border-brand-forest/20 text-brand-forest disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </Container>

      {/* Mobile Filters Slide-over Drawer */}
      <Drawer
        open={isFilterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        position="right"
        className="max-w-xs"
      >
        <DrawerHeader onClose={() => setFilterDrawerOpen(false)}>
          <span className="font-editorial text-lg text-brand-forest">Filter Catalog</span>
        </DrawerHeader>
        <DrawerContent className="p-6 overflow-y-auto">
          <FilterControls />
        </DrawerContent>
        <DrawerFooter>
          <Button
            className="w-full bg-brand-forest text-brand-cornsilk"
            onClick={() => setFilterDrawerOpen(false)}
          >
            Show {totalItems} Results
          </Button>
        </DrawerFooter>
      </Drawer>
    </div>
  );
}
