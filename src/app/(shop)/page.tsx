import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-cornsilk py-20 sm:py-28 border-b border-brand-forest/10">
        <Container className="relative z-10 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4 px-3 py-1">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-brand-copper" />
            Curated Botanical & Mindful Essentials
          </Badge>

          <h1 className="font-display max-w-4xl text-4xl font-bold tracking-tight text-brand-forest sm:text-6xl lg:text-7xl">
            Pure Elegance Rooted in Nature.
          </h1>

          <p className="font-accent mt-4 text-xl sm:text-2xl text-brand-copper">
            Conscious living designed for the modern sanctuary.
          </p>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-brand-forest/80 leading-relaxed font-sans">
            Welcome to Aura & Earth. A thoughtfully designed commerce experience
            crafted with artisanal craftsmanship, sustainable materials, and an
            uncompromising commitment to quality.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="gap-2">
                Explore Collections
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-copper" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Architecture & Foundation Status Section */}
      <section>
        <Container>
          <div className="flex flex-col items-center text-center mb-10">
            <Badge variant="default" className="mb-2">
              Architecture Status
            </Badge>
            <h2 className="font-display text-3xl font-bold text-brand-forest">
              Production Foundation Highlights
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Clean full-stack Next.js App Router foundation prepared for future
              phases of commerce, AI assistant, and administrative business logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-olive/10 text-brand-olive mb-2">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle>Next.js & TypeScript</CardTitle>
                <CardDescription>
                  Scalable App Router architecture with strict typing, modular layout
                  boundaries, and fast static + SSR delivery.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-mono text-brand-forest/70">
                Route groups: (shop), (admin), (auth)
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-clay/20 text-brand-forest mb-2">
                  <ShieldCheck className="h-5 w-5 text-brand-copper" />
                </div>
                <CardTitle>Supabase SSR Integration</CardTitle>
                <CardDescription>
                  Secure cookie-based authentication, browser client, server client,
                  and edge session-refresh middleware.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-mono text-brand-forest/70">
                PostgreSQL & Storage prepared
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-copper/10 text-brand-copper mb-2">
                  <Zap className="h-5 w-5" />
                </div>
                <CardTitle>Tailwind & shadcn Primitives</CardTitle>
                <CardDescription>
                  Custom design brief color tokens (Cornsilk, Black Forest, Olive
                  Leaf, Sunlit Clay, Copperwood) and typography.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs font-mono text-brand-forest/70">
                Abel, Roboto Mono, Courgette & Swash
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Discovery Showcase Section */}
      <section className="bg-brand-cornsilk/50 py-12 border-y border-brand-forest/10">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <span className="font-accent text-sm text-brand-copper">Preview</span>
              <h3 className="font-display text-2xl font-bold text-brand-forest">
                Curated Categories
              </h3>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-brand-olive hover:underline inline-flex items-center gap-1"
            >
              View catalog <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Organic Living",
                items: "24 items",
                tag: "Bestseller",
              },
              {
                title: "Artisanal Ceramics",
                items: "18 items",
                tag: "New Season",
              },
              {
                title: "Aromatherapy",
                items: "32 items",
                tag: "Handcrafted",
              },
              {
                title: "Botanical Decor",
                items: "15 items",
                tag: "Limited",
              },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg border border-brand-forest/10 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-forest/5 text-brand-forest group-hover:bg-brand-olive group-hover:text-brand-cornsilk transition-colors mb-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="mb-2">
                  {cat.tag}
                </Badge>
                <h4 className="font-display text-lg font-semibold text-brand-forest">
                  {cat.title}
                </h4>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {cat.items}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
