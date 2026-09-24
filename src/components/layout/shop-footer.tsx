"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function ShopFooter() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-brand-forest/15 bg-brand-forest text-brand-cornsilk">
      {/* Newsletter Section */}
      <div className="border-b border-brand-cornsilk/10 py-12 md:py-16">
        <Container>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl space-y-2">
              <span className="font-accent text-sm text-brand-clay flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Join The Sanctuary
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-brand-cornsilk">
                Stories of craftsmanship, mindful design & early edition releases.
              </h3>
              <p className="text-xs sm:text-sm text-brand-cornsilk/70">
                Receive our monthly private journal and 10% off your inaugural order.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              {subscribed ? (
                <div className="flex items-center gap-2 rounded-lg bg-brand-olive/30 border border-brand-olive/50 p-4 text-xs font-mono text-brand-cornsilk animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-brand-clay flex-shrink-0" />
                  <span>Welcome to our sanctuary. Your welcome note is on its way.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="flex-1 rounded-lg border border-brand-cornsilk/20 bg-brand-cornsilk/10 px-4 py-2.5 text-xs sm:text-sm text-brand-cornsilk placeholder:text-brand-cornsilk/50 focus:border-brand-clay focus:outline-none focus:ring-1 focus:ring-brand-clay"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-brand-olive px-4 py-2.5 text-xs sm:text-sm font-medium text-brand-cornsilk hover:bg-brand-olive/90 active:scale-95 transition-all shadow-sm flex-shrink-0"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <span className="font-display text-2xl font-bold tracking-tight text-brand-cornsilk">
              {siteConfig.name}
            </span>
            <p className="text-xs text-brand-cornsilk/70 leading-relaxed">
              Curated botanical and artisanal homeware crafted for quiet living and lasting rituals.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-brand-clay">
              <Shield className="h-4 w-4" />
              <span>Certified Sustainable Craft</span>
            </div>
          </div>

          {/* Catalog links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-clay">
              Catalog
            </h4>
            <ul className="space-y-2 text-xs text-brand-cornsilk/80">
              <li>
                <Link href="/products" className="hover:text-brand-clay transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=ceramics" className="hover:text-brand-clay transition-colors">
                  Artisanal Ceramics
                </Link>
              </li>
              <li>
                <Link href="/products?category=textiles" className="hover:text-brand-clay transition-colors">
                  Handcrafted Textiles
                </Link>
              </li>
              <li>
                <Link href="/products?category=aromatherapy" className="hover:text-brand-clay transition-colors">
                  Aromatherapy & Ritual
                </Link>
              </li>
              <li>
                <Link href="/products?category=living" className="hover:text-brand-clay transition-colors">
                  Organic Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-clay">
              Customer Sanctuary
            </h4>
            <ul className="space-y-2 text-xs text-brand-cornsilk/80">
              <li>
                <Link href="/account" className="hover:text-brand-clay transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-brand-clay transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-brand-clay transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-brand-clay transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-clay transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & System */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-brand-clay">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-brand-cornsilk/80">
              <li>
                <Link href="/admin" className="hover:text-brand-clay transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-brand-clay transition-colors">
                  System Telemetry
                </Link>
              </li>
              <li>
                <Link href="/todos" className="hover:text-brand-clay transition-colors">
                  Supabase Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-cornsilk/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-brand-cornsilk/60 gap-4">
          <p>© {new Date().getFullYear()} Aura & Earth Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-brand-clay">Natural Luxury · Ethical Living</span>
            <span>Plastic-Free Delivery</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
