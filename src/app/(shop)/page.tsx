"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  ShoppingBag,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/shared/product-card";
import { CategoryCard } from "@/components/shared/category-card";
import { GeminiKeyCard } from "@/components/shared/gemini-key-card";
import { PRODUCTS, CATEGORIES } from "@/data/mock-data";

export default function HomePage() {
  const [selectedCategoryTab, setSelectedCategoryTab] = React.useState<string>("all");

  const filteredFeaturedProducts =
    selectedCategoryTab === "all"
      ? PRODUCTS.slice(0, 4)
      : PRODUCTS.filter((p) => p.categorySlug === selectedCategoryTab).slice(0, 4);

  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-brand-cornsilk py-16 sm:py-24 border-b border-brand-forest/10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge variant="secondary" className="px-3.5 py-1 text-xs">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand-copper" />
                Artisanal Living & Mindful Sanctuary
              </Badge>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-brand-forest leading-[1.08]">
                Pure Elegance Rooted in Nature.
              </h1>

              <p className="font-accent text-xl sm:text-2xl text-brand-copper">
                Conscious objects crafted for slow living and enduring peace.
              </p>

              <p className="max-w-xl text-base sm:text-lg text-brand-forest/80 leading-relaxed font-sans mx-auto lg:mx-0">
                Aura & Earth creates soulful homeware in collaboration with independent ceramicists,
                weavers, and herbalists worldwide. Ethically sourced, plastic-free, and built to outlive generations.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/products">
                    <span>Explore Collection</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <Link href="/products?category=ceramics">
                    <span>View Ceramics</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-brand-forest/15 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1200"
                  alt="Aura & Earth Artisanal Ceramics"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-card/90 backdrop-blur-md border border-brand-forest/10 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-brand-copper">
                        Spotlight Craft
                      </p>
                      <p className="font-display text-base font-bold text-brand-forest">
                        Fluted Ochre Ceramic Vase
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-brand-forest">
                      $88.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. VALUE PROPOSITIONS BAR */}
      <section className="-mt-8 sm:-mt-12 relative z-20">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-xl border border-brand-forest/15 bg-card/95 p-6 shadow-md backdrop-blur-md">
            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-olive/15 text-brand-olive">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-brand-forest">Complimentary Shipping</h4>
                <p className="text-[11px] text-muted-foreground">On all orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-clay/20 text-brand-copper">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-brand-forest">Artisanal Mastery</h4>
                <p className="text-[11px] text-muted-foreground">Handmade in small batches</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-olive/15 text-brand-olive">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-brand-forest">100% Sustainable</h4>
                <p className="text-[11px] text-muted-foreground">Plastic-free recyclable transit</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-clay/20 text-brand-copper">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-brand-forest">30-Day Sanctuary Guarantee</h4>
                <p className="text-[11px] text-muted-foreground">Effortless return process</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. CATEGORY DISCOVERY SHOWCASE */}
      <section>
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="font-accent text-sm text-brand-copper">Curated Spaces</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-forest">
                Discover By Ritual
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono font-medium text-brand-olive hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.slice(0, 4).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. FEATURED COLLECTION SECTION WITH TABS */}
      <section className="bg-brand-cornsilk/50 py-16 border-y border-brand-forest/10">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <Badge variant="default" className="mb-2">
                Handcrafted Essentials
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-brand-forest">
                Featured Botanical Collection
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                Every object carries intentional form, organic material textures, and enduring presence.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 font-mono text-xs">
              {[
                { label: "All Items", value: "all" },
                { label: "Ceramics", value: "ceramics" },
                { label: "Textiles", value: "textiles" },
                { label: "Aromatherapy", value: "aromatherapy" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategoryTab(tab.value)}
                  className={`rounded-full px-3.5 py-1.5 transition-all whitespace-nowrap ${
                    selectedCategoryTab === tab.value
                      ? "bg-brand-forest text-brand-cornsilk font-semibold shadow-sm"
                      : "bg-brand-forest/5 text-brand-forest hover:bg-brand-forest/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFeaturedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline" asChild className="gap-2">
              <Link href="/products">
                <span>View Full Catalog ({PRODUCTS.length} Items)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* 5. INTERACTIVE USER GEMINI KEY CARD */}
      <section>
        <Container size="narrow">
          <GeminiKeyCard />
        </Container>
      </section>

      {/* 6. EDITORIAL BRAND PHILOSOPHY SECTION */}
      <section className="relative overflow-hidden bg-brand-forest text-brand-cornsilk py-20 rounded-2xl mx-4 sm:mx-8">
        <Container className="relative z-10 text-center max-w-3xl space-y-6">
          <span className="font-accent text-lg sm:text-xl text-brand-clay">
            The Aura & Earth Philosophy
          </span>

          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-brand-cornsilk leading-tight">
            &ldquo;In a world of noise, we curate quiet spaces with objects of enduring warmth.&rdquo;
          </h2>

          <p className="text-sm sm:text-base text-brand-cornsilk/80 leading-relaxed font-sans max-w-2xl mx-auto">
            We work exclusively with generational artisans who prioritize handcraft over mass manufacturing.
            By blending earth-pigment terracottas, washed French flax, and wild Japanese Hinoki cypress,
            we help transform ordinary living spaces into restorative personal sanctuaries.
          </p>

          <div className="pt-4 flex justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-brand-clay text-brand-forest hover:bg-brand-clay/90 gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Shop Artisanal Goods</span>
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* 7. TRENDING / NEW ARRIVALS GRID */}
      <section>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-accent text-sm text-brand-copper">Trending Now</span>
              <h2 className="font-display text-3xl font-bold text-brand-forest">
                Seasonal Favorites
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono text-brand-olive hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
