import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export function ShopFooter() {
  return (
    <footer className="border-t border-brand-forest/10 bg-brand-forest text-brand-cornsilk">
      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <span className="font-display text-2xl font-bold tracking-tight">
              {siteConfig.name}
            </span>
            <p className="max-w-sm text-sm text-brand-cornsilk/80">
              {siteConfig.description}
            </p>
            <p className="font-accent text-brand-clay text-sm">
              Mindfully curated · Ethically sourced · Crafted for life
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-brand-clay font-mono">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-brand-cornsilk/80">
              <li>
                <Link href="/products" className="hover:text-brand-cornsilk transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-brand-cornsilk transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-cornsilk transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-brand-clay font-mono">
              Account & Support
            </h4>
            <ul className="space-y-2 text-sm text-brand-cornsilk/80">
              <li>
                <Link href="/login" className="hover:text-brand-cornsilk transition-colors">
                  Account Login
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-cornsilk transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-brand-cornsilk transition-colors">
                  System Health
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-cornsilk/10 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-cornsilk/60">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-mono">Built with Next.js, Supabase & Tailwind CSS</p>
        </div>
      </Container>
    </footer>
  );
}
