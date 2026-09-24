"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";
import { productService } from "@/services/product.service";
import type { Product, Category } from "@/types/catalog.types";
import { PRODUCTS, CATEGORIES } from "@/data/mock-data";
import { formatCurrency } from "@/utils/formatters";

const SUGGESTIONS = [
  "Ceramic Vase",
  "Belgian Linen",
  "Hinoki Diffuser",
  "Olive Wood Board",
  "Matcha Bowl",
];

export function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>(CATEGORIES);
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && isSearchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
      // Fetch categories if needed
      productService.getCategories().then((cats) => {
        if (cats.length > 0) setCategories(cats);
      });
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Live Supabase Search Debounce
  React.useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productService.getProducts({
          search: query.trim(),
          limit: 6,
        });
        setSearchResults(res.products);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const filteredCategories = query.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelectProduct = (slug: string) => {
    setSearchOpen(false);
    router.push(`/products/${slug}`);
  };

  const handleSelectCategory = (slug: string) => {
    setSearchOpen(false);
    router.push(`/products?category=${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-forest/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => setSearchOpen(false)}
      />

      {/* Modal Dialog Window */}
      <div className="relative z-50 w-full max-w-2xl overflow-hidden rounded-xl border border-brand-forest/15 bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Search Header / Input */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-brand-forest/10 px-4 py-3">
          <Search className="h-5 w-5 text-brand-forest/50 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ceramics, textiles, botanical oils..."
            className="flex-1 bg-transparent text-sm sm:text-base text-brand-forest placeholder:text-muted-foreground outline-none font-sans"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-brand-forest"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-brand-forest/5 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
              ESC
            </kbd>
          )}
        </form>

        {/* Search Body Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Query Results */}
          {query.trim() ? (
            <div>
              {isSearching ? (
                <div className="py-12 text-center text-xs font-mono text-muted-foreground">
                  Searching Supabase catalog...
                </div>
              ) : searchResults.length === 0 && filteredCategories.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-brand-forest">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try searching for &quot;vase&quot;, &quot;linen&quot;, or &quot;candle&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Category matches */}
                  {filteredCategories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Collections ({filteredCategories.length})
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat.slug)}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-brand-forest/10 hover:bg-brand-forest/5 text-left transition-colors"
                          >
                            <span className="text-sm font-medium text-brand-forest">{cat.name}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product matches from Supabase */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                        Artisanal Objects ({searchResults.length})
                      </p>
                      <div className="divide-y divide-brand-forest/10 rounded-lg border border-brand-forest/10 bg-card overflow-hidden">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product.slug)}
                            className="flex items-center gap-3 w-full p-2.5 hover:bg-brand-forest/5 transition-colors text-left"
                          >
                            <div className="relative h-12 w-12 rounded-md overflow-hidden bg-brand-forest/5 flex-shrink-0">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brand-forest truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {product.category} • {formatCurrency(product.price)}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Default: Popular Suggestions & Recent Categories */
            <div className="space-y-6">
              {/* Popular Searches */}
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-brand-copper" />
                  <span>Popular Inquiries</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setQuery(sug)}
                      className="rounded-full border border-brand-forest/15 bg-brand-forest/5 px-3 py-1 text-xs text-brand-forest hover:bg-brand-olive/20 hover:border-brand-olive transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories */}
              <div>
                <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Browse by Ritual
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.slug)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-forest/5 text-left transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-brand-olive" />
                      <span className="text-xs font-medium text-brand-forest truncate">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-brand-forest/10 bg-brand-forest/5 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="rounded bg-card px-1.5 py-0.5 border border-brand-forest/15">Enter ↵</kbd>
            <span>to view full catalog results</span>
          </div>
          <span className="hidden sm:inline">Aura & Earth Atelier</span>
        </div>
      </div>
    </div>
  );
}
