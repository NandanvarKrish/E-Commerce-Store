"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  Search,
  User,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export function ShopHeader() {
  const pathname = usePathname();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, setSearchOpen, setCartDrawerOpen } =
    useUIStore();
  const { getTotalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const [mounted, setMounted] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ email?: string } | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser({ email: user.email });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setCurrentUser({ email: session.user.email });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const totalCartCount = mounted ? getTotalItems() : 0;
  const totalWishlistCount = mounted ? wishlistItems.length : 0;

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-forest/10 bg-brand-cornsilk/90 backdrop-blur-md transition-colors">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="font-display text-2xl font-bold tracking-tight text-brand-forest transition-colors hover:text-brand-olive"
          >
            {siteConfig.name}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {siteConfig.mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-brand-olive",
                    isActive ? "text-brand-olive font-semibold" : "text-brand-forest/80"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search collection"
            className="flex items-center gap-2 rounded-full p-2 text-brand-forest/80 hover:bg-brand-forest/5 hover:text-brand-forest transition-colors"
          >
            <Search className="h-5 w-5" />
            <span className="hidden lg:inline text-xs font-mono text-muted-foreground pr-1">
              Search <kbd className="text-[10px] bg-brand-forest/5 px-1 py-0.5 rounded">⌘K</kbd>
            </span>
          </button>

          {/* Wishlist Link with Live Badge */}
          <Link
            href="/wishlist"
            aria-label="Saved Items"
            className="relative rounded-full p-2 text-brand-forest/80 hover:bg-brand-forest/5 hover:text-brand-forest transition-colors"
          >
            <Heart className="h-5 w-5" />
            {totalWishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-copper text-[10px] font-mono font-bold text-brand-cornsilk shadow-sm animate-in zoom-in">
                {totalWishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Drawer Trigger with Live Badge */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            aria-label="Shopping Bag"
            className="relative rounded-full p-2 text-brand-forest/80 hover:bg-brand-forest/5 hover:text-brand-forest transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-olive text-[10px] font-mono font-bold text-brand-cornsilk shadow-sm animate-in zoom-in">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Account Dropdown Menu */}
          <DropdownMenu>
            <DropdownTrigger className="rounded-full p-2 text-brand-forest/80 hover:bg-brand-forest/5 hover:text-brand-forest transition-colors">
              <User className="h-5 w-5" />
              <ChevronDown className="h-3 w-3 ml-0.5 text-muted-foreground hidden sm:inline" />
            </DropdownTrigger>
            <DropdownContent align="right" className="w-56">
              {currentUser ? (
                <>
                  <div className="px-2.5 py-1.5 text-xs">
                    <p className="font-semibold text-brand-forest truncate">{currentUser.email}</p>
                    <p className="font-mono text-[10px] text-brand-olive">Signed In Member</p>
                  </div>
                  <DropdownSeparator />
                  <Link href="/account">
                    <DropdownItem>
                      <User className="h-4 w-4 text-brand-olive" />
                      <span>Account Sanctuary</span>
                    </DropdownItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownItem>
                      <Package className="h-4 w-4 text-brand-copper" />
                      <span>Order History</span>
                    </DropdownItem>
                  </Link>
                  <Link href="/admin">
                    <DropdownItem>
                      <ShieldCheck className="h-4 w-4 text-brand-clay" />
                      <span>Admin Portal</span>
                    </DropdownItem>
                  </Link>
                  <DropdownSeparator />
                  <DropdownItem onClick={handleSignOut} destructive>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownItem>
                </>
              ) : (
                <>
                  <div className="px-2.5 py-1.5 text-xs text-muted-foreground">
                    <p className="font-medium text-brand-forest">Welcome Guest</p>
                    <p className="text-[11px]">Sign in to access your orders</p>
                  </div>
                  <DropdownSeparator />
                  <Link href="/login">
                    <DropdownItem>
                      <User className="h-4 w-4 text-brand-olive" />
                      <span>Sign In</span>
                    </DropdownItem>
                  </Link>
                  <Link href="/register">
                    <DropdownItem>
                      <SlidersHorizontal className="h-4 w-4 text-brand-copper" />
                      <span>Create Account</span>
                    </DropdownItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownItem>
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>Order Lookup</span>
                    </DropdownItem>
                  </Link>
                  <Link href="/admin">
                    <DropdownItem>
                      <ShieldCheck className="h-4 w-4 text-brand-clay" />
                      <span>Admin Portal</span>
                    </DropdownItem>
                  </Link>
                </>
              )}
            </DropdownContent>
          </DropdownMenu>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-brand-forest md:hidden rounded-md hover:bg-brand-forest/5"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="border-b border-brand-forest/10 bg-brand-cornsilk md:hidden animate-in slide-in-from-top-2">
          <Container className="py-4 space-y-3">
            {/* Mobile Search Bar Button */}
            <button
              onClick={() => {
                closeMobileMenu();
                setSearchOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-brand-forest/15 bg-background px-3 py-2 text-sm text-muted-foreground mb-2"
            >
              <Search className="h-4 w-4 text-brand-forest/50" />
              <span>Search products & collections...</span>
            </button>

            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "block py-2 text-base font-medium transition-colors hover:text-brand-olive",
                  pathname === item.href ? "text-brand-olive font-semibold" : "text-brand-forest"
                )}
              >
                {item.title}
              </Link>
            ))}

            <div className="pt-3 border-t border-brand-forest/10 flex flex-col gap-2">
              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-2 text-sm text-brand-forest"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-brand-copper" />
                  Wishlist
                </span>
                {totalWishlistCount > 0 && (
                  <span className="font-mono text-xs font-semibold text-brand-copper">
                    {totalWishlistCount} items
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-2 text-sm text-brand-forest"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-brand-olive" />
                  Shopping Bag
                </span>
                {totalCartCount > 0 && (
                  <span className="font-mono text-xs font-semibold text-brand-olive">
                    {totalCartCount} items
                  </span>
                )}
              </Link>

              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 py-2 text-sm font-mono text-brand-copper"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
