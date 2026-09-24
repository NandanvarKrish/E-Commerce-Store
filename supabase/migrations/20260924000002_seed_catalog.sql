-- ==============================================================================
-- Aura & Earth - Seed Initial Store Catalog (Categories, Brands, Products, Images, Inventory)
-- Valid Hexadecimal UUIDs only (0-9, a-f)
-- ==============================================================================

-- 1. Brands
INSERT INTO public.brands (id, name, slug, description, website)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'Aura & Earth Atelier', 'aura-earth', 'Handcrafted sustainable home essentials made by independent artisans.', 'https://auraearth.store'),
  ('b0000000-0000-0000-0000-000000000002', 'Studio Terracotta', 'studio-terracotta', 'Wheel-thrown pottery and raw clay stoneware crafted in Portugal.', 'https://studioterracotta.com'),
  ('b0000000-0000-0000-0000-000000000003', 'Kanso Woodworks', 'kanso-woodworks', 'Minimalist solid walnut and oak home objects with Japanese joinery.', 'https://kansowood.jp'),
  ('b0000000-0000-0000-0000-000000000004', 'Lumina Botanica', 'lumina-botanica', 'Organic beeswax and essential oil botanical candles and diffusers.', 'https://luminabotanica.bio')
ON CONFLICT (id) DO NOTHING;

-- 2. Categories
INSERT INTO public.categories (id, name, slug, description, image_url)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Artisanal Ceramics', 'ceramics', 'Wheel-thrown earthenware and organic glazed porcelain vessels.', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000002', 'Handcrafted Textiles', 'textiles', 'Natural washed French linen, wool throws, and organic cotton blankets.', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000003', 'Aromatherapy & Ritual', 'aromatherapy', 'Hand-poured rapeseed wax candles, pure botanical essential oils, and stone warmers.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000004', 'Ambient Lighting', 'lighting', 'Pleated paper shades, brass sconces, and rechargeable cordless table lamps.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000005', 'Fine Woodcraft', 'woodcraft', 'Hand-carved walnut boards, turned oak bowls, and solid teak trays.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000006', 'Living & Flora', 'living', 'Terracotta planters, brass misting cans, and sculptural pruning tools.', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (id) DO NOTHING;

-- 3. Products
INSERT INTO public.products (id, title, slug, description, price, compare_at_price, sku, category_id, brand_id, is_active, is_featured, rating, reviews_count, metadata)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'Fluted Stoneware Vase',
    'fluted-stoneware-vase',
    'Hand-thrown ribbed stoneware vase with a tactile matte chalk glaze. Sculptural empty or filled with dried botanicals. Made in small batches in Alentejo, Portugal.',
    88.00,
    110.00,
    'VASE-FLUTED-01',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    true,
    true,
    4.9,
    38,
    '{"badge": "Bestseller", "dimensions": "8.5\" H x 5.2\" Dia", "materials": "Coarse Portuguese Stoneware, Chalk White Matte Glaze"}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'Washed Linen Throw Blanket',
    'washed-linen-throw-blanket',
    'Woven from 100% certified Normandy flax, pre-washed for effortless drape and relaxed texture. Breathable year-round warmth.',
    145.00,
    NULL,
    'BLANKET-LINEN-02',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    true,
    true,
    4.8,
    24,
    '{"badge": "New", "dimensions": "55\" W x 78\" L", "materials": "100% Normandy Flax Linen (OEKO-TEX Standard 100)"}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'Hinoki Wood Candle & Brass Snuffer',
    'hinoki-wood-candle',
    'Pure rapeseed and coconut wax infused with Japanese cypress, cedarwood, and smoke. Comes with an antiqued solid brass snuffer.',
    64.00,
    75.00,
    'CANDLE-HINOKI-03',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    true,
    true,
    5.0,
    52,
    '{"badge": "Bestseller", "dimensions": "3.8\" H x 3.4\" Dia (11 oz)", "materials": "Natural Wax, Organic Essential Oils, Solid Brass"}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'Cordless Brass Accent Lamp',
    'cordless-brass-accent-lamp',
    'Portable, rechargeable warm-white LED lamp with touch-dimming. Spun solid brass base with an opal glass diffuser. Up to 18 hours per charge.',
    195.00,
    220.00,
    'LAMP-CORDLESS-04',
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    true,
    true,
    4.7,
    19,
    '{"badge": "Artisanal", "dimensions": "10.2\" H x 4.8\" Base Dia", "materials": "Spun Brass, Hand-Blown Opal Glass, Lithium-Ion Battery"}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'Carved Walnut Cutting Board',
    'carved-walnut-cutting-board',
    'Single-piece solid American black walnut cutting board with sculptured handle and juice groove. Hand-rubbed with food-safe organic beeswax.',
    120.00,
    NULL,
    'BOARD-WALNUT-05',
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000003',
    true,
    false,
    4.9,
    31,
    '{"badge": "Artisanal", "dimensions": "18\" L x 11\" W x 1\" H", "materials": "Sustainably Harvested American Black Walnut"}'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'Terracotta Pedestal Planter',
    'terracotta-pedestal-planter',
    'Elevated architectural planter thrown from dense Tuscan terracotta with built-in drainage tray. Develops an authentic weathered patina.',
    78.00,
    NULL,
    'PLANTER-PEDESTAL-06',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000002',
    true,
    false,
    4.6,
    14,
    '{"badge": "Sale", "dimensions": "9.5\" H x 8.0\" Dia", "materials": "Porous Tuscan Terracotta, Clay Pedestal"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Product Images
INSERT INTO public.product_images (id, product_id, url, alt_text, sort_order, is_primary)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000', 'Fluted Stoneware Vase in Chalk White', 0, true),
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=1000', 'Fluted Stoneware Vase detail', 1, false),
  ('e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1000', 'Washed Linen Throw Blanket in Sand', 0, true),
  ('e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000', 'Hinoki Wood Candle in Amber Glass', 0, true),
  ('e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=1000', 'Cordless Brass Accent Lamp warm glow', 0, true),
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000', 'Carved Walnut Cutting Board top angle', 0, true),
  ('e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1000', 'Terracotta Pedestal Planter with succulent', 0, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Inventory
INSERT INTO public.inventory (id, product_id, quantity, reserved_quantity, low_stock_threshold)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 12, 1, 3),
  ('d0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 8, 0, 2),
  ('d0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 25, 2, 5),
  ('d0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 6, 0, 2),
  ('d0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005', 14, 0, 4),
  ('d0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006', 18, 0, 4)
ON CONFLICT (id) DO NOTHING;
