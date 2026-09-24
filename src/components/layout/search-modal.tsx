"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";
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
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredCategories = query.trim()
    ? CATEGORIES.filter((c) =>
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
              {filteredProducts.length === 0 && filteredCategories.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-brand-forest">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try checking your spelling or search for general terms like &quot;vase&quot; or &quot;linen&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Category matches */}
                  {filteredCategories.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {filteredCategories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectCategory(c.slug)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-clay/20 px-3 py-1 text-xs font-medium text-brand-forest hover:bg-brand-clay/30 transition-colors"
                          >
                            <span>{c.name}</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product matches */}
                  {filteredProducts.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Products ({filteredProducts.length})
                      </h4>
                      <div className="divide-y divide-brand-forest/10 rounded-lg border border-brand-forest/10 overflow-hidden">
                        {filteredProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p.slug)}
                            className="flex items-center gap-3 p-3 transition-colors hover:bg-brand-forest/5 cursor-pointer"
                          >
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-brand-forest/5">
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono uppercase text-muted-foreground truncate">
                                {p.category}
                              </p>
                              <p className="text-sm font-medium text-brand-forest truncate">
                                {p.name}
                              </p>
                            </div>
                            <div className="text-right font-mono text-xs font-semibold text-brand-forest">
                              {formatCurrency(p.price)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Suggestions & Quick Links when input is empty */
            <div className="space-y-4">
              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-brand-copper" />
                  <span>Popular Inquiries</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-brand-forest/15 px-3 py-1 text-xs font-medium text-brand-forest hover:bg-brand-forest/5 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Browse by Collection
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCategory(c.slug)}
                      className="flex items-center justify-between rounded-lg border border-brand-forest/10 p-2.5 text-left text-xs font-medium text-brand-forest hover:bg-brand-forest/5 transition-colors"
                    >
                      <span className="truncate">{c.name}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-brand-forest/10 bg-brand-forest/5 px-4 py-2 text-[11px] font-mono text-muted-foreground">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> Select result
          </span>
        </div>
      </div>
    </div>
  );
}
