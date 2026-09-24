-- ==============================================================================
-- Aura & Earth - E-Commerce Platform Database Migration
-- Fully compliant with PostgreSQL 17 and Supabase Best Practices
-- Tables: profiles, categories, brands, products, product_variants,
--         product_images, inventory, carts, cart_items, wishlists,
--         wishlist_items, addresses, orders, order_items, reviews, notifications
-- ==============================================================================

-- 1. Helper Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Types
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Base Timestamp Management Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ==============================================================================
-- 4. Tables Creation
-- ==============================================================================

-- 4.1 PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'customer',
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helper function to check admin role safely without search path injection
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 4.2 CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.3 BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  logo_url text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.4 PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  cost_price numeric(10,2),
  sku text UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  rating numeric(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.5 PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL,
  sku text UNIQUE,
  price numeric(10,2) CHECK (price IS NULL OR price >= 0),
  compare_at_price numeric(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= price),
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.6 PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.7 INVENTORY
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_inventory_product_variant UNIQUE NULLS NOT DISTINCT (product_id, variant_id)
);

-- 4.8 CARTS
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_carts_user UNIQUE (user_id)
);

-- 4.9 CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_cart_product_variant UNIQUE NULLS NOT DISTINCT (cart_id, product_id, variant_id)
);

-- 4.10 WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Wishlist',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_wishlists_user UNIQUE (user_id)
);

-- 4.11 WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_wishlist_product UNIQUE (wishlist_id, product_id)
);

-- 4.12 ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_type text NOT NULL DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
  full_name text NOT NULL,
  company text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'US',
  phone text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.13 ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  currency text NOT NULL DEFAULT 'USD',
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (shipping_cost >= 0),
  tax_amount numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  discount_amount numeric(10,2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb NOT NULL,
  billing_address jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.14 ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title text NOT NULL,
  variant_title text,
  sku text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.15 REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text NOT NULL,
  is_verified_purchase boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_product_review UNIQUE (user_id, product_id)
);

-- 4.16 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  type text NOT NULL DEFAULT 'order_status',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. Foreign Key & Query Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands(slug);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON public.product_images(product_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant_id ON public.inventory(variant_id);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON public.carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON public.cart_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON public.wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product_id ON public.wishlist_items(product_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON public.addresses(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_published ON public.reviews(product_id, is_published);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

-- ==============================================================================
-- 6. Updated At Triggers
-- ==============================================================================
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename IN ('profiles', 'categories', 'brands', 'products', 'product_variants', 
                        'inventory', 'carts', 'cart_items', 'wishlists', 'addresses', 'orders', 'reviews')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();', t, t);
  END LOOP;
END $$;

-- ==============================================================================
-- 7. Auth User Provisioning Trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- If metadata requests admin (or default customer)
  IF (NEW.raw_app_meta_data->>'role' = 'admin' OR NEW.raw_user_meta_data->>'role' = 'admin') THEN
    assigned_role := 'admin'::public.user_role;
  ELSE
    assigned_role := 'customer'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  -- Initialize a shopping cart
  INSERT INTO public.carts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Initialize default wishlist
  INSERT INTO public.wishlists (user_id, name)
  VALUES (NEW.id, 'My Wishlist')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. Data API & Role Permissions
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- ==============================================================================
-- 9. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9.1 PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id OR public.is_admin())
  WITH CHECK ((SELECT auth.uid()) = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id OR public.is_admin());

-- 9.2 CATEGORIES POLICIES (Public read, admin write)
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.3 BRANDS POLICIES (Public read, admin write)
DROP POLICY IF EXISTS "brands_select_public" ON public.brands;
CREATE POLICY "brands_select_public" ON public.brands
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "brands_admin_all" ON public.brands;
CREATE POLICY "brands_admin_all" ON public.brands
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.4 PRODUCTS POLICIES (Active products public, all products for admin, admin write)
DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public" ON public.products
  FOR SELECT TO public
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.5 PRODUCT VARIANTS POLICIES (Public read, admin write)
DROP POLICY IF EXISTS "product_variants_select_public" ON public.product_variants;
CREATE POLICY "product_variants_select_public" ON public.product_variants
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "product_variants_admin_all" ON public.product_variants;
CREATE POLICY "product_variants_admin_all" ON public.product_variants
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.6 PRODUCT IMAGES POLICIES (Public read, admin write)
DROP POLICY IF EXISTS "product_images_select_public" ON public.product_images;
CREATE POLICY "product_images_select_public" ON public.product_images
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "product_images_admin_all" ON public.product_images;
CREATE POLICY "product_images_admin_all" ON public.product_images
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.7 INVENTORY POLICIES (Public stock read, admin write)
DROP POLICY IF EXISTS "inventory_select_public" ON public.inventory;
CREATE POLICY "inventory_select_public" ON public.inventory
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "inventory_admin_all" ON public.inventory;
CREATE POLICY "inventory_admin_all" ON public.inventory
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.8 CARTS POLICIES (User accesses only their own cart)
DROP POLICY IF EXISTS "carts_select_owner" ON public.carts;
CREATE POLICY "carts_select_owner" ON public.carts
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "carts_insert_owner" ON public.carts;
CREATE POLICY "carts_insert_owner" ON public.carts
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "carts_update_owner" ON public.carts;
CREATE POLICY "carts_update_owner" ON public.carts
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "carts_delete_owner" ON public.carts;
CREATE POLICY "carts_delete_owner" ON public.carts
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- 9.9 CART ITEMS POLICIES
DROP POLICY IF EXISTS "cart_items_select_owner" ON public.cart_items;
CREATE POLICY "cart_items_select_owner" ON public.cart_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carts c 
    WHERE c.id = cart_id AND (c.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "cart_items_insert_owner" ON public.cart_items;
CREATE POLICY "cart_items_insert_owner" ON public.cart_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.carts c 
    WHERE c.id = cart_id AND (c.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "cart_items_update_owner" ON public.cart_items;
CREATE POLICY "cart_items_update_owner" ON public.cart_items
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carts c 
    WHERE c.id = cart_id AND (c.user_id = (SELECT auth.uid()) OR public.is_admin())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.carts c 
    WHERE c.id = cart_id AND (c.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "cart_items_delete_owner" ON public.cart_items;
CREATE POLICY "cart_items_delete_owner" ON public.cart_items
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.carts c 
    WHERE c.id = cart_id AND (c.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

-- 9.10 WISHLISTS POLICIES
DROP POLICY IF EXISTS "wishlists_select_owner" ON public.wishlists;
CREATE POLICY "wishlists_select_owner" ON public.wishlists
  FOR SELECT TO public
  USING (is_public = true OR (SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "wishlists_insert_owner" ON public.wishlists;
CREATE POLICY "wishlists_insert_owner" ON public.wishlists
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "wishlists_update_owner" ON public.wishlists;
CREATE POLICY "wishlists_update_owner" ON public.wishlists
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "wishlists_delete_owner" ON public.wishlists;
CREATE POLICY "wishlists_delete_owner" ON public.wishlists
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- 9.11 WISHLIST ITEMS POLICIES
DROP POLICY IF EXISTS "wishlist_items_select_owner" ON public.wishlist_items;
CREATE POLICY "wishlist_items_select_owner" ON public.wishlist_items
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = wishlist_id AND (w.is_public = true OR w.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "wishlist_items_insert_owner" ON public.wishlist_items;
CREATE POLICY "wishlist_items_insert_owner" ON public.wishlist_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = wishlist_id AND (w.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "wishlist_items_delete_owner" ON public.wishlist_items;
CREATE POLICY "wishlist_items_delete_owner" ON public.wishlist_items
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.wishlists w 
    WHERE w.id = wishlist_id AND (w.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

-- 9.12 ADDRESSES POLICIES
DROP POLICY IF EXISTS "addresses_select_owner" ON public.addresses;
CREATE POLICY "addresses_select_owner" ON public.addresses
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_insert_owner" ON public.addresses;
CREATE POLICY "addresses_insert_owner" ON public.addresses
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_update_owner" ON public.addresses;
CREATE POLICY "addresses_update_owner" ON public.addresses
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "addresses_delete_owner" ON public.addresses;
CREATE POLICY "addresses_delete_owner" ON public.addresses
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- 9.13 ORDERS POLICIES
DROP POLICY IF EXISTS "orders_select_owner" ON public.orders;
CREATE POLICY "orders_select_owner" ON public.orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_owner" ON public.orders;
CREATE POLICY "orders_insert_owner" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.14 ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "order_items_select_owner" ON public.order_items;
CREATE POLICY "order_items_select_owner" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND (o.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "order_items_insert_owner" ON public.order_items;
CREATE POLICY "order_items_insert_owner" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND (o.user_id = (SELECT auth.uid()) OR public.is_admin())
  ));

DROP POLICY IF EXISTS "order_items_update_admin" ON public.order_items;
CREATE POLICY "order_items_update_admin" ON public.order_items
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9.15 REVIEWS POLICIES
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT TO public
  USING (is_published = true OR (SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "reviews_update_owner" ON public.reviews;
CREATE POLICY "reviews_update_owner" ON public.reviews
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_owner" ON public.reviews;
CREATE POLICY "reviews_delete_owner" ON public.reviews
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_admin());

-- 9.16 NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "notifications_select_owner" ON public.notifications;
CREATE POLICY "notifications_select_owner" ON public.notifications
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "notifications_update_owner" ON public.notifications;
CREATE POLICY "notifications_update_owner" ON public.notifications
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "notifications_admin_all" ON public.notifications;
CREATE POLICY "notifications_admin_all" ON public.notifications
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. Storage Buckets and Storage RLS Policies
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Objects Policies for product-images
DROP POLICY IF EXISTS "product_images_storage_select" ON storage.objects;
CREATE POLICY "product_images_storage_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_storage_insert" ON storage.objects;
CREATE POLICY "product_images_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_storage_update" ON storage.objects;
CREATE POLICY "product_images_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "product_images_storage_delete" ON storage.objects;
CREATE POLICY "product_images_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- Storage Objects Policies for avatars
DROP POLICY IF EXISTS "avatars_storage_select" ON storage.objects;
CREATE POLICY "avatars_storage_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_storage_insert" ON storage.objects;
CREATE POLICY "avatars_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "avatars_storage_update" ON storage.objects;
CREATE POLICY "avatars_storage_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_admin()
    )
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "avatars_storage_delete" ON storage.objects;
CREATE POLICY "avatars_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_admin()
    )
  );
