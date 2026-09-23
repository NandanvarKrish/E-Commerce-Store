"use client";

import Link from "next/link";
import { Menu, X, ShoppingBag, User, ShieldCheck } from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

export function ShopHeader() {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-forest/10 bg-brand-cornsilk/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="font-display text-2xl font-bold tracking-tight text-brand-forest transition-colors hover:text-brand-olive"
          >
            {siteConfig.name}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-brand-forest/80 hover:text-brand-olive transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded bg-brand-clay/20 text-brand-forest hover:bg-brand-clay/30 transition-colors"
            title="Admin Dashboard"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-brand-copper" />
            <span>Admin</span>
          </Link>

          <Link
            href="/login"
            className="p-2 text-brand-forest hover:text-brand-olive transition-colors"
            aria-label="User Account"
          >
            <User className="h-5 w-5" />
          </Link>

          <Link
            href="/cart"
            className="relative p-2 text-brand-forest hover:text-brand-olive transition-colors"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-olive text-[10px] font-mono font-bold text-brand-cornsilk">
              0
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-brand-forest md:hidden"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="border-b border-brand-forest/10 bg-brand-cornsilk md:hidden animate-in slide-in-from-top-2">
          <Container className="py-4 space-y-3">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="block py-2 text-base font-medium text-brand-forest hover:text-brand-olive transition-colors"
              >
                {item.title}
              </Link>
            ))}
            <div className="pt-2 border-t border-brand-forest/10 flex flex-col gap-2">
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 py-2 text-sm font-mono text-brand-copper"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block py-2 text-sm font-medium text-brand-forest hover:text-brand-olive"
              >
                Sign In / Register
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
