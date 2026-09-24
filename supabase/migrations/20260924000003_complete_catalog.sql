-- ==============================================================================
-- Aura & Earth - Complete Store Catalog Migration
-- Adds full 8-product collection, categories, brands, product variants,
-- rich images, accurate inventory, and verified customer reviews.
-- ==============================================================================

-- 1. Ensure Categories
INSERT INTO public.categories (id, name, slug, description, image_url)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Artisanal Ceramics', 'ceramics', 'Wheel-thrown earthenware and organic glazed porcelain vessels.', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000002', 'Handcrafted Textiles', 'textiles', 'Natural washed French linen, wool throws, and organic cotton blankets.', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000003', 'Aromatherapy & Ritual', 'aromatherapy', 'Pure botanical essential blends, hand-poured soy candles, and stone incense burners.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000004', 'Ambient Lighting', 'lighting', 'Pleated paper shades, brass sconces, and rechargeable cordless table lamps.', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000005', 'Fine Woodcraft', 'woodcraft', 'Hand-carved walnut boards, turned oak bowls, and solid teak trays.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000006', 'Organic Living', 'living', 'Reclaimed olive wood kitchen essentials and sustainable heirloom homeware.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000007', 'Botanical Decor', 'decor', 'Sculptural vessels, dried floral botanicals, and hand-carved stone artifacts.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'),
  ('c0000000-0000-0000-0000-000000000008', 'Mindful Apparel', 'apparel', 'Relaxed silhouettes made from undyed organic hemp and brushed cotton.', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 2. Ensure Brands
INSERT INTO public.brands (id, name, slug, description, website)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'Aura & Earth Atelier', 'aura-earth', 'Handcrafted sustainable home essentials made by independent artisans.', 'https://auraearth.store'),
  ('b0000000-0000-0000-0000-000000000002', 'Studio Terracotta', 'studio-terracotta', 'Wheel-thrown pottery and raw clay stoneware crafted in Portugal and Kyoto.', 'https://studioterracotta.com'),
  ('b0000000-0000-0000-0000-000000000003', 'Kanso Woodworks', 'kanso-woodworks', 'Minimalist solid walnut and reclaimed olive wood home objects.', 'https://kansowood.jp'),
  ('b0000000-0000-0000-0000-000000000004', 'Lumina Botanica', 'lumina-botanica', 'Organic beeswax and essential oil botanical candles and stone diffusers.', 'https://luminabotanica.bio')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Upsert 8 Flagship Products
INSERT INTO public.products (id, title, slug, description, price, compare_at_price, sku, category_id, brand_id, is_active, is_featured, rating, reviews_count, metadata)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'Fluted Ochre Ceramic Vase',
    'ceramic-fluted-vase',
    'Hand-thrown in small batches by master potters in Kyoto. The Fluted Ochre Vase features a natural tactile texture finished with a matte, unglazed earthy exterior and a waterproof glazed interior. Each piece holds subtle variations in tone, celebrating the beauty of imperfection.',
    88.00,
    110.00,
    'AE-CER-001',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    true,
    true,
    4.9,
    38,
    '{
      "badge": "Bestseller",
      "shortDescription": "Wheel-thrown earthenware vase with textural fluting and organic warm clay tones.",
      "features": [
        "100% locally sourced stoneware clay",
        "Water-sealed interior for live botanical arrangements",
        "Matte unglazed exterior with gentle hand-fluted ridges",
        "Dishwasher safe, hand washing recommended"
      ],
      "dimensions": "Height: 9.5\" (24cm) | Diameter: 5.2\" (13cm)",
      "materials": "Terracotta Stoneware with Food-Grade Mineral Glaze",
      "care": "Wipe with a damp lint-free cloth. Hand wash with mild botanical soap.",
      "colors": [
        {"name": "Sunlit Clay", "hex": "#dda15e"},
        {"name": "Olive Leaf", "hex": "#606c38"},
        {"name": "Raw Cornsilk", "hex": "#fefae0"}
      ],
      "sizes": ["Standard (9.5\")", "Grand (13\")"],
      "tags": ["ceramics", "vase", "earthy", "tableware", "decor"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'Pure Washed Belgian Linen Duvet',
    'french-linen-duvet-cover',
    'Woven from 100% certified organic flax grown in Normandy. Pre-washed with natural pumice stones for unprecedented softness from night one. Naturally temperature-regulating and breathable for year-round restful slumber.',
    240.00,
    280.00,
    'AE-TEX-002',
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    true,
    true,
    4.8,
    64,
    '{
      "badge": "Artisanal",
      "shortDescription": "Ultra-breathable Belgian flax linen duvet cover with mother-of-pearl button closure.",
      "features": [
        "100% organic French & Belgian flax",
        "Pre-washed with stone enzyme bath",
        "Hypoallergenic and naturally antibacterial",
        "Interior corner ties to anchor duvet insert"
      ],
      "dimensions": "Queen: 90\" x 92\" | King: 106\" x 92\"",
      "materials": "175 GSM Normandy Flax Linen",
      "care": "Machine wash cold on gentle cycle. Tumble dry low or line dry in the shade.",
      "colors": [
        {"name": "Forest Moss", "hex": "#283618"},
        {"name": "Natural Cornsilk", "hex": "#fefae0"},
        {"name": "Warm Clay", "hex": "#dda15e"}
      ],
      "sizes": ["Full/Queen", "King/Cal King"],
      "tags": ["textiles", "linen", "bedding", "organic"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'Kyoto Hinoki Botanical Oil & Stone Diffuser',
    'hinoki-cypress-diffuser',
    'A passive diffusion ritual utilizing hand-carved lava rock encased in a solid Japanese cypress bowl. Includes a 30ml vial of steam-distilled Hinoki, Cedarwood, and Bergamot essential oils for deep sensory grounding.',
    64.00,
    NULL,
    'AE-ARO-003',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    true,
    true,
    4.9,
    42,
    '{
      "badge": "New",
      "shortDescription": "Volcanic stone passive diffuser with pure steam-distilled Japanese cypress oil.",
      "features": [
        "No electricity or water required",
        "Hand-turned solid Hinoki cypress timber bowl",
        "Includes 30ml cold-pressed botanical oil blend",
        "Re-scent indefinitely with your favorite oils"
      ],
      "dimensions": "Diameter: 4.5\" (11.5cm) | Height: 3.2\" (8cm)",
      "materials": "Sustainably Harvested Hinoki Timber & Basalt Volcanic Rock",
      "care": "Wipe wooden vessel with dry cloth. Add 4-6 drops of oil directly onto porous stones.",
      "tags": ["diffuser", "aromatherapy", "essential-oils", "hinoki", "ritual"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    'Heirloom Olive Wood Serving Board',
    'reclaimed-olive-wood-board',
    'Crafted from non-fruit-bearing centuries-old Mediterranean olive trees. Each serving paddle exhibits dense swirling grain patterns and a natural live edge. Finished purely with organic cold-pressed walnut oil.',
    95.00,
    120.00,
    'AE-LIV-004',
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000003',
    true,
    true,
    4.7,
    29,
    '{
      "badge": "Sale",
      "shortDescription": "Heavyweight olive wood board with live edge grain and leather hanging lanyard.",
      "features": [
        "Carved from single-block reclaimed olive timber",
        "Naturally non-porous and knife-friendly",
        "Treated with food-safe botanical oils and beeswax",
        "Vegetable-tanned leather hanging strap"
      ],
      "dimensions": "Length: 18\" (46cm) | Width: 8.5\" (22cm) | Thickness: 1\"",
      "materials": "100% Reclaimed Mediterranean Olive Wood",
      "care": "Hand wash with lukewarm water. Periodically hydrate with mineral or walnut oil.",
      "sizes": ["Medium (14\")", "Large (18\")", "Banquet (24\")"],
      "tags": ["kitchen", "wood", "charcuterie", "entertaining"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    'Travertine Arch Bookends (Pair)',
    'sculptural-stone-bookends',
    'Carved from Italian Roman travertine, celebrated for its warm beige coloration and natural pitting. These monolithic arch forms serve both as steadfast bookends and freestanding minimalist art objects.',
    115.00,
    NULL,
    'AE-DEC-005',
    'c0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000001',
    true,
    false,
    4.8,
    19,
    '{
      "badge": "Artisanal",
      "shortDescription": "Solid honed Roman travertine sculptural arch bookends in pairs.",
      "features": [
        "Solid natural unpolished travertine stone",
        "Felt padded base to safeguard delicate surfaces",
        "Substantial 7.5 lb weight per pair",
        "Timeless architectural silhouette"
      ],
      "dimensions": "Height: 6.5\" | Width: 4.5\" | Depth: 2.5\" (each)",
      "materials": "Honed Natural Roman Travertine",
      "care": "Dust with a microfiber cloth. Do not use acidic or harsh cleaners.",
      "tags": ["decor", "stone", "travertine", "minimalist", "books"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000006',
    'Brushed Hemp & Cotton Kimono Robe',
    'relaxed-organic-hemp-kimono',
    'An intentional layer crafted from a weighted 55% true hemp and 45% organic combed cotton blend. Tailored with wide dropped sleeves, deep pockets, and a removable waist sash for slow mornings and tranquil evenings.',
    165.00,
    195.00,
    'AE-APP-006',
    'c0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000001',
    true,
    true,
    4.9,
    31,
    '{
      "badge": "Bestseller",
      "shortDescription": "Unisex brushed hemp robe with deep patch pockets and relaxed drape.",
      "features": [
        "55% Organic Hemp / 45% Organic Combed Cotton",
        "Low-impact vegetable garment dye",
        "Reinforced French seams for longevity",
        "Deep dual front patch pockets"
      ],
      "dimensions": "Unisex relaxed sizing (Length: 46\")",
      "materials": "280 GSM Organic Hemp Cotton Blend",
      "care": "Machine wash cold with eco-detergent. Hang dry recommended.",
      "colors": [
        {"name": "Clay Earth", "hex": "#bc6c25"},
        {"name": "Forest Moss", "hex": "#283618"},
        {"name": "Natural Chalk", "hex": "#fefae0"}
      ],
      "sizes": ["S/M", "L/XL"],
      "tags": ["apparel", "loungewear", "hemp", "sustainable", "robe"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000007',
    'Kintsugi Glazed Chawan Matcha Bowl',
    'stoneware-matcha-bowl',
    'Hand-pinched chawan bowl designed specifically for the whisking ritual of ceremonial grade matcha. Features an organic textured exterior and a subtle gold-dusted crackle interior rim.',
    52.00,
    NULL,
    'AE-CER-007',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    true,
    false,
    4.7,
    23,
    '{
      "badge": "New",
      "shortDescription": "Handmade ceramic chawan bowl with indented thumb grip for morning tea rituals.",
      "features": [
        "Sculpted by hand on a manual kick wheel",
        "Ergonomic thumb depression for effortless whisking",
        "Lead-free, food-safe high-fire ceramic"
      ],
      "dimensions": "Diameter: 4.8\" (12cm) | Height: 3.1\" (8cm) | Capacity: 12oz",
      "materials": "Stoneware with Ash Glaze",
      "care": "Rinse gently with warm water immediately after use. Air dry thoroughly.",
      "tags": ["matcha", "tea", "ceramics", "ritual"]
    }'::jsonb
  ),
  (
    'f0000000-0000-0000-0000-000000000008',
    'Cedar & Wild Vetiver Botanical Candle',
    'amber-glass-candle',
    'Poured by hand in small artisan batches using 100% renewable Midwest soy wax and pure botanical extracts. Scented with notes of damp cedar, Haitian vetiver, crushed cardamon, and warm amber resin.',
    38.00,
    NULL,
    'AE-ARO-008',
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000004',
    true,
    true,
    5.0,
    51,
    '{
      "badge": "Bestseller",
      "shortDescription": "60-hour burn soy wax candle in recycled apothecary amber jar with crackling wood wick.",
      "features": [
        "100% American grown non-GMO soy wax",
        "FSC certified sustainably sourced wooden wick",
        "Zero paraffin, phthalates, or synthetic fragrance",
        "Clean 60+ hour burn time"
      ],
      "dimensions": "Volume: 10oz (280g) | Height: 3.8\"",
      "materials": "Soy Wax, Botanical Oils, Amber Glass",
      "care": "Trim wooden wick to 1/4\" prior to each lighting. Allow full melt pool on first burn.",
      "tags": ["candle", "soy", "vetiver", "amber", "aromatherapy"]
    }'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  sku = EXCLUDED.sku,
  category_id = EXCLUDED.category_id,
  brand_id = EXCLUDED.brand_id,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  metadata = EXCLUDED.metadata;

-- 4. Clean & Upsert Product Images
DELETE FROM public.product_images;
INSERT INTO public.product_images (id, product_id, url, alt_text, sort_order, is_primary)
VALUES
  -- Prod 1: Fluted Ochre Ceramic Vase
  ('e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000', 'Fluted Ochre Ceramic Vase angled view', 0, true),
  ('e0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000', 'Fluted Ochre Ceramic Vase closeup texture', 1, false),
  ('e0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=1000', 'Fluted Ochre Ceramic Vase styled on wooden sideboard', 2, false),
  -- Prod 2: Pure Washed Belgian Linen Duvet
  ('e0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1000', 'Pure Washed Belgian Linen Duvet on natural wood bed', 0, true),
  ('e0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000', 'Linen fabric folded texture detail', 1, false),
  -- Prod 3: Kyoto Hinoki Diffuser
  ('e0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1000', 'Kyoto Hinoki Botanical Oil & Stone Diffuser set', 0, true),
  ('e0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1000', 'Hinoki essential oil dropper application', 1, false),
  -- Prod 4: Heirloom Olive Wood Board
  ('e0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000', 'Heirloom Olive Wood Serving Board with charcuterie', 0, true),
  ('e0000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000', 'Olive wood live edge detail', 1, false),
  -- Prod 5: Travertine Arch Bookends
  ('e0000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000', 'Travertine Arch Bookends styled with art books', 0, true),
  ('e0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000', 'Travertine stone texture macro view', 1, false),
  -- Prod 6: Brushed Hemp & Cotton Kimono Robe
  ('e0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000', 'Brushed Hemp Kimono Robe in Clay Earth', 0, true),
  ('e0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000', 'Hemp robe waist tie and sleeve detail', 1, false),
  -- Prod 7: Kintsugi Glazed Chawan Matcha Bowl
  ('e0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000', 'Kintsugi Glazed Chawan Matcha Bowl top view', 0, true),
  ('e0000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000', 'Matcha bowl gold rim detail', 1, false),
  -- Prod 8: Cedar & Wild Vetiver Botanical Candle
  ('e0000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1000', 'Cedar & Wild Vetiver Candle lit in amber glass', 0, true),
  ('e0000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1000', 'Soy candle wooden wick crackle closeup', 1, false);

-- 5. Product Variants (Color & Size Configurations)
DELETE FROM public.product_variants;
INSERT INTO public.product_variants (id, product_id, title, sku, price, compare_at_price, options)
VALUES
  -- Prod 1: Fluted Vase
  ('fa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Sunlit Clay / Standard (9.5")', 'AE-CER-001-SC-STD', 88.00, 110.00, '{"color": "Sunlit Clay", "colorHex": "#dda15e", "size": "Standard (9.5\")"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'Olive Leaf / Standard (9.5")', 'AE-CER-001-OL-STD', 88.00, 110.00, '{"color": "Olive Leaf", "colorHex": "#606c38", "size": "Standard (9.5\")"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'Raw Cornsilk / Grand (13")', 'AE-CER-001-RC-GRD', 115.00, 135.00, '{"color": "Raw Cornsilk", "colorHex": "#fefae0", "size": "Grand (13\")"}'::jsonb),
  -- Prod 2: Belgian Linen Duvet
  ('fa000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'Forest Moss / Full/Queen', 'AE-TEX-002-FM-QN', 240.00, 280.00, '{"color": "Forest Moss", "colorHex": "#283618", "size": "Full/Queen"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'Natural Cornsilk / King/Cal King', 'AE-TEX-002-NC-KG', 270.00, 310.00, '{"color": "Natural Cornsilk", "colorHex": "#fefae0", "size": "King/Cal King"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002', 'Warm Clay / Full/Queen', 'AE-TEX-002-WC-QN', 240.00, 280.00, '{"color": "Warm Clay", "colorHex": "#dda15e", "size": "Full/Queen"}'::jsonb),
  -- Prod 4: Olive Wood Board
  ('fa000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000004', 'Medium (14")', 'AE-LIV-004-MED', 75.00, 90.00, '{"size": "Medium (14\")"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000004', 'Large (18")', 'AE-LIV-004-LRG', 95.00, 120.00, '{"size": "Large (18\")"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000004', 'Banquet (24")', 'AE-LIV-004-BNQ', 135.00, 160.00, '{"size": "Banquet (24\")"}'::jsonb),
  -- Prod 6: Kimono Robe
  ('fa000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000006', 'Clay Earth / S/M', 'AE-APP-006-CE-SM', 165.00, 195.00, '{"color": "Clay Earth", "colorHex": "#bc6c25", "size": "S/M"}'::jsonb),
  ('fa000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000006', 'Forest Moss / L/XL', 'AE-APP-006-FM-LXL', 165.00, 195.00, '{"color": "Forest Moss", "colorHex": "#283618", "size": "L/XL"}'::jsonb);

-- 6. Upsert Inventory
DELETE FROM public.inventory;
INSERT INTO public.inventory (id, product_id, quantity, reserved_quantity, low_stock_threshold)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 14, 0, 3),
  ('d0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000002', 8, 0, 2),
  ('d0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000003', 22, 1, 5),
  ('d0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000004', 11, 0, 4),
  ('d0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000005', 6, 0, 2),
  ('d0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000006', 17, 2, 4),
  ('d0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000007', 19, 0, 5),
  ('d0000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000008', 25, 3, 5);

-- 7. Seed Initial Customer Reviews
DELETE FROM public.reviews;
INSERT INTO public.reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, is_published, created_at)
VALUES
  (
    'bb000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    5,
    'Sublime organic craftsmanship',
    'The textural weight of this vase is extraordinary. It commands quiet attention on our dining table. Will cherish for decades.',
    true,
    true,
    now() - interval '14 days'
  ),
  (
    'bb000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    5,
    'Stunning warm color',
    'The ochre shade is exactly as pictured—warm, matte, and grounding. Shipped in completely plastic-free paper packaging.',
    true,
    true,
    now() - interval '30 days'
  ),
  (
    'bb000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    5,
    'Best sleep investment ever',
    'So soft yet delightfully crisp. It gets softer with every wash. Worth every single penny.',
    true,
    true,
    now() - interval '21 days'
  ),
  (
    'bb000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    5,
    'Instant tranquility',
    'The scent of wild Hinoki brings the tranquil spirit of mountain temples right into my studio. Absolutely mesmerizing.',
    true,
    true,
    now() - interval '5 days'
  ),
  (
    'bb000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    5,
    'Spectacular grain pattern',
    'This is a work of art on our counter. Heavy, durable, and breathtaking craftsmanship.',
    true,
    true,
    now() - interval '60 days'
  );
