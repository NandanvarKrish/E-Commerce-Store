export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewsCount: number;
  badge?: "Bestseller" | "New" | "Sale" | "Artisanal";
  images: string[];
  description: string;
  shortDescription: string;
  features: string[];
  dimensions: string;
  materials: string;
  care: string;
  inStock: boolean;
  stockCount: number;
  sku: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tags: string[];
  reviews: ProductReview[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const CATEGORIES: Category[] = [
  {
    id: "ceramics",
    slug: "ceramics",
    name: "Artisanal Ceramics",
    description: "Wheel-thrown earthenware and organic glazed porcelain vessels.",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
    itemCount: 18,
  },
  {
    id: "textiles",
    slug: "textiles",
    name: "Handcrafted Textiles",
    description: "Natural washed French linen, wool throws, and organic cotton blankets.",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800",
    itemCount: 14,
  },
  {
    id: "aromatherapy",
    slug: "aromatherapy",
    name: "Aromatherapy & Ritual",
    description: "Pure botanical essential blends, hand-poured soy candles, and stone incense burners.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
    itemCount: 22,
  },
  {
    id: "living",
    slug: "living",
    name: "Organic Living",
    description: "Reclaimed olive wood kitchen essentials and sustainable heirloom homeware.",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
    itemCount: 16,
  },
  {
    id: "decor",
    slug: "decor",
    name: "Botanical Decor",
    description: "Sculptural vessels, dried floral botanicals, and hand-carved stone artifacts.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
    itemCount: 12,
  },
  {
    id: "apparel",
    slug: "apparel",
    name: "Mindful Apparel",
    description: "Relaxed silhouettes made from undyed organic hemp and brushed cotton.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    itemCount: 9,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "ceramic-fluted-vase",
    name: "Fluted Ochre Ceramic Vase",
    category: "Artisanal Ceramics",
    categorySlug: "ceramics",
    price: 88,
    compareAtPrice: 110,
    rating: 4.9,
    reviewsCount: 38,
    badge: "Bestseller",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "Hand-thrown in small batches by master potters in Kyoto. The Fluted Ochre Vase features a natural tactile texture finished with a matte, unglazed earthy exterior and a waterproof glazed interior. Each piece holds subtle variations in tone, celebrating the beauty of imperfection.",
    shortDescription: "Wheel-thrown earthenware vase with textural fluting and organic warm clay tones.",
    features: [
      "100% locally sourced stoneware clay",
      "Water-sealed interior for live botanical arrangements",
      "Matte unglazed exterior with gentle hand-fluted ridges",
      "Dishwasher safe, hand washing recommended",
    ],
    dimensions: "Height: 9.5\" (24cm) | Diameter: 5.2\" (13cm)",
    materials: "Terracotta Stoneware with Food-Grade Mineral Glaze",
    care: "Wipe with a damp lint-free cloth. Hand wash with mild botanical soap.",
    inStock: true,
    stockCount: 14,
    sku: "AE-CER-001",
    colors: [
      { name: "Sunlit Clay", hex: "#dda15e" },
      { name: "Olive Leaf", hex: "#606c38" },
      { name: "Raw Cornsilk", hex: "#fefae0" },
    ],
    sizes: ["Standard (9.5\")", "Grand (13\")"],
    tags: ["ceramics", "vase", "earthy", "tableware", "decor"],
    reviews: [
      {
        id: "rev-1",
        author: "Camille Laurent",
        rating: 5,
        date: "2 weeks ago",
        title: "Sublime organic craftsmanship",
        comment: "The textural weight of this vase is extraordinary. It commands quiet attention on our dining table. Will cherish for decades.",
        verified: true,
      },
      {
        id: "rev-2",
        author: "Julian Hayes",
        rating: 5,
        date: "1 month ago",
        title: "Stunning warm color",
        comment: "The ochre shade is exactly as pictured—warm, matte, and grounding. Shipped in completely plastic-free paper packaging.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-2",
    slug: "french-linen-duvet-cover",
    name: "Pure Washed Belgian Linen Duvet",
    category: "Handcrafted Textiles",
    categorySlug: "textiles",
    price: 240,
    compareAtPrice: 280,
    rating: 4.8,
    reviewsCount: 64,
    badge: "Artisanal",
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "Woven from 100% certified organic flax grown in Normandy. Pre-washed with natural pumice stones for unprecedented softness from night one. Naturally temperature-regulating and breathable for year-round restful slumber.",
    shortDescription: "Ultra-breathable Belgian flax linen duvet cover with mother-of-pearl button closure.",
    features: [
      "100% organic French & Belgian flax",
      "Pre-washed with stone enzyme bath",
      "Hypoallergenic and naturally antibacterial",
      "Interior corner ties to anchor duvet insert",
    ],
    dimensions: "Queen: 90\" x 92\" | King: 106\" x 92\"",
    materials: "175 GSM Normandy Flax Linen",
    care: "Machine wash cold on gentle cycle. Tumble dry low or line dry in the shade.",
    inStock: true,
    stockCount: 8,
    sku: "AE-TEX-002",
    colors: [
      { name: "Forest Moss", hex: "#283618" },
      { name: "Natural Cornsilk", hex: "#fefae0" },
      { name: "Warm Clay", hex: "#dda15e" },
    ],
    sizes: ["Full/Queen", "King/Cal King"],
    tags: ["textiles", "linen", "bedding", "organic"],
    reviews: [
      {
        id: "rev-3",
        author: "Sarah K.",
        rating: 5,
        date: "3 weeks ago",
        title: "Best sleep investment ever",
        comment: "So soft yet delightfully crisp. It gets softer with every wash. Worth every single penny.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-3",
    slug: "hinoki-cypress-diffuser",
    name: "Kyoto Hinoki Botanical Oil & Stone Diffuser",
    category: "Aromatherapy & Ritual",
    categorySlug: "aromatherapy",
    price: 64,
    rating: 4.9,
    reviewsCount: 42,
    badge: "New",
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "A passive diffusion ritual utilizing hand-carved lava rock encased in a solid Japanese cypress bowl. Includes a 30ml vial of steam-distilled Hinoki, Cedarwood, and Bergamot essential oils for deep sensory grounding.",
    shortDescription: "Volcanic stone passive diffuser with pure steam-distilled Japanese cypress oil.",
    features: [
      "No electricity or water required",
      "Hand-turned solid Hinoki cypress timber bowl",
      "Includes 30ml cold-pressed botanical oil blend",
      "Re-scent indefinitely with your favorite oils",
    ],
    dimensions: "Diameter: 4.5\" (11.5cm) | Height: 3.2\" (8cm)",
    materials: "Sustainably Harvested Hinoki Timber & Basalt Volcanic Rock",
    care: "Wipe wooden vessel with dry cloth. Add 4-6 drops of oil directly onto porous stones.",
    inStock: true,
    stockCount: 22,
    sku: "AE-ARO-003",
    tags: ["diffuser", "aromatherapy", "essential-oils", "hinoki", "ritual"],
    reviews: [
      {
        id: "rev-4",
        author: "Marcus Vance",
        rating: 5,
        date: "5 days ago",
        title: "Instant tranquility",
        comment: "The scent of wild Hinoki brings the tranquil spirit of mountain temples right into my studio. Absolutely mesmerizing.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-4",
    slug: "reclaimed-olive-wood-board",
    name: "Heirloom Olive Wood Serving Board",
    category: "Organic Living",
    categorySlug: "living",
    price: 95,
    compareAtPrice: 120,
    rating: 4.7,
    reviewsCount: 29,
    badge: "Sale",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "Crafted from non-fruit-bearing centuries-old Mediterranean olive trees. Each serving paddle exhibits dense swirling grain patterns and a natural live edge. Finished purely with organic cold-pressed walnut oil.",
    shortDescription: "Heavyweight olive wood board with live edge grain and leather hanging lanyard.",
    features: [
      "Carved from single-block reclaimed olive timber",
      "Naturally non-porous and knife-friendly",
      "Treated with food-safe botanical oils and beeswax",
      "Vegetable-tanned leather hanging strap",
    ],
    dimensions: "Length: 18\" (46cm) | Width: 8.5\" (22cm) | Thickness: 1\"",
    materials: "100% Reclaimed Mediterranean Olive Wood",
    care: "Hand wash with lukewarm water. Periodically hydrate with mineral or walnut oil.",
    inStock: true,
    stockCount: 11,
    sku: "AE-LIV-004",
    sizes: ["Medium (14\")", "Large (18\")", "Banquet (24\")"],
    tags: ["kitchen", "wood", "charcuterie", "entertaining"],
    reviews: [
      {
        id: "rev-5",
        author: "Devon Reed",
        rating: 5,
        date: "2 months ago",
        title: "Spectacular grain pattern",
        comment: "This is a work of art on our counter. Heavy, durable, and breathtaking craftsmanship.",
        verified: true,
      },
    ],
  },
  {
    id: "prod-5",
    slug: "sculptural-stone-bookends",
    name: "Travertine Arch Bookends (Pair)",
    category: "Botanical Decor",
    categorySlug: "decor",
    price: 115,
    rating: 4.8,
    reviewsCount: 19,
    badge: "Artisanal",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "Carved from Italian Roman travertine, celebrated for its warm beige coloration and natural pitting. These monolithic arch forms serve both as steadfast bookends and freestanding minimalist art objects.",
    shortDescription: "Solid honed Roman travertine sculptural arch bookends in pairs.",
    features: [
      "Solid natural unpolished travertine stone",
      "Felt padded base to safeguard delicate surfaces",
      "Substantial 7.5 lb weight per pair",
      "Timeless architectural silhouette",
    ],
    dimensions: "Height: 6.5\" | Width: 4.5\" | Depth: 2.5\" (each)",
    materials: "Honed Natural Roman Travertine",
    care: "Dust with a microfiber cloth. Do not use acidic or harsh cleaners.",
    inStock: true,
    stockCount: 6,
    sku: "AE-DEC-005",
    tags: ["decor", "stone", "travertine", "minimalist", "books"],
    reviews: [],
  },
  {
    id: "prod-6",
    slug: "relaxed-organic-hemp-kimono",
    name: "Brushed Hemp & Cotton Kimono Robe",
    category: "Mindful Apparel",
    categorySlug: "apparel",
    price: 165,
    compareAtPrice: 195,
    rating: 4.9,
    reviewsCount: 31,
    badge: "Bestseller",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "An intentional layer crafted from a weighted 55% true hemp and 45% organic combed cotton blend. Tailored with wide dropped sleeves, deep pockets, and a removable waist sash for slow mornings and tranquil evenings.",
    shortDescription: "Unisex brushed hemp robe with deep patch pockets and relaxed drape.",
    features: [
      "55% Organic Hemp / 45% Organic Combed Cotton",
      "Low-impact vegetable garment dye",
      "Reinforced French seams for longevity",
      "Deep dual front patch pockets",
    ],
    dimensions: "Unisex relaxed sizing (Length: 46\")",
    materials: "280 GSM Organic Hemp Cotton Blend",
    care: "Machine wash cold with eco-detergent. Hang dry recommended.",
    inStock: true,
    stockCount: 17,
    sku: "AE-APP-006",
    colors: [
      { name: "Clay Earth", hex: "#bc6c25" },
      { name: "Forest Moss", hex: "#283618" },
      { name: "Natural Chalk", hex: "#fefae0" },
    ],
    sizes: ["S/M", "L/XL"],
    tags: ["apparel", "loungewear", "hemp", "sustainable", "robe"],
    reviews: [],
  },
  {
    id: "prod-7",
    slug: "stoneware-matcha-bowl",
    name: "Kintsugi Glazed Chawan Matcha Bowl",
    category: "Artisanal Ceramics",
    categorySlug: "ceramics",
    price: 52,
    rating: 4.7,
    reviewsCount: 23,
    badge: "New",
    images: [
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "Hand-pinched chawan bowl designed specifically for the whisking ritual of ceremonial grade matcha. Features an organic textured exterior and a subtle gold-dusted crackle interior rim.",
    shortDescription: "Handmade ceramic chawan bowl with indented thumb grip for morning tea rituals.",
    features: [
      "Sculpted by hand on a manual kick wheel",
      "Ergonomic thumb depression for effortless whisking",
      "Lead-free, food-safe high-fire ceramic",
    ],
    dimensions: "Diameter: 4.8\" (12cm) | Height: 3.1\" (8cm) | Capacity: 12oz",
    materials: "Stoneware with Ash Glaze",
    care: "Rinse gently with warm water immediately after use. Air dry thoroughly.",
    inStock: true,
    stockCount: 19,
    sku: "AE-CER-007",
    tags: ["matcha", "tea", "ceramics", "ritual"],
    reviews: [],
  },
  {
    id: "prod-8",
    slug: "amber-glass-candle",
    name: "Cedar & Wild Vetiver Botanical Candle",
    category: "Aromatherapy & Ritual",
    categorySlug: "aromatherapy",
    price: 38,
    rating: 5.0,
    reviewsCount: 51,
    badge: "Bestseller",
    images: [
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1000",
    ],
    description: "Poured by hand in small artisan batches using 100% renewable Midwest soy wax and pure botanical extracts. Scented with notes of damp cedar, Haitian vetiver, crushed cardamon, and warm amber resin.",
    shortDescription: "60-hour burn soy wax candle in recycled apothecary amber jar with crackling wood wick.",
    features: [
      "100% American grown non-GMO soy wax",
      "FSC certified sustainably sourced wooden wick",
      "Zero paraffin, phthalates, or synthetic fragrance",
      "Clean 60+ hour burn time",
    ],
    dimensions: "Volume: 10oz (280g) | Height: 3.8\"",
    materials: "Soy Wax, Botanical Oils, Amber Glass",
    care: "Trim wooden wick to 1/4\" prior to each lighting. Allow full melt pool on first burn.",
    inStock: true,
    stockCount: 25,
    sku: "AE-ARO-008",
    tags: ["candle", "soy", "vetiver", "amber", "aromatherapy"],
    reviews: [],
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-9421",
    date: "Sep 21, 2026",
    status: "Delivered",
    trackingNumber: "TRK-8839210-US",
    carrier: "GreenEco Ground",
    estimatedDelivery: "Sep 23, 2026",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        slug: "ceramic-fluted-vase",
        name: "Fluted Ochre Ceramic Vase",
        image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600",
        price: 88,
        quantity: 1,
        variant: "Sunlit Clay / Standard",
      },
      {
        id: "item-2",
        productId: "prod-8",
        slug: "amber-glass-candle",
        name: "Cedar & Wild Vetiver Botanical Candle",
        image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600",
        price: 38,
        quantity: 2,
      },
    ],
    subtotal: 164,
    shipping: 0,
    tax: 13.12,
    total: 177.12,
    shippingAddress: {
      fullName: "Eleanor Vance",
      street: "742 Evergreen Botanical Way",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "United States",
    },
  },
  {
    id: "ORD-8921",
    date: "Sep 14, 2026",
    status: "Processing",
    trackingNumber: "TRK-5520912-US",
    carrier: "CarbonNeutral Express",
    estimatedDelivery: "Sep 27, 2026",
    items: [
      {
        id: "item-3",
        productId: "prod-2",
        slug: "french-linen-duvet-cover",
        name: "Pure Washed Belgian Linen Duvet",
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600",
        price: 240,
        quantity: 1,
        variant: "Forest Moss / Queen",
      },
    ],
    subtotal: 240,
    shipping: 0,
    tax: 19.20,
    total: 259.20,
    shippingAddress: {
      fullName: "Eleanor Vance",
      street: "742 Evergreen Botanical Way",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "United States",
    },
  },
];

export const MOCK_USER = {
  name: "Eleanor Vance",
  email: "eleanor.vance@mindfulliving.org",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  memberSince: "January 2025",
  phone: "+1 (503) 892-4410",
  addresses: [
    {
      id: "addr-1",
      title: "Home Sanctuary (Default)",
      street: "742 Evergreen Botanical Way",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "United States",
      isDefault: true,
    },
    {
      id: "addr-2",
      title: "Design Studio",
      street: "128 Pearl Arts District, Suite 4B",
      city: "Portland",
      state: "OR",
      zipCode: "97209",
      country: "United States",
      isDefault: false,
    },
  ],
};
