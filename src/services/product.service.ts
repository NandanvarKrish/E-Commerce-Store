import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { PRODUCTS, CATEGORIES } from "@/data/mock-data";
import type {
  Product,
  Category,
  Brand,
  ProductFilters,
  PaginatedProducts,
  ProductReview,
  ProductVariantItem,
} from "@/types/catalog.types";

/**
 * Raw joined database product shape from Supabase PostgREST
 */
interface RawDbProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  rating: number | string;
  reviews_count: number;
  metadata: {
    badge?: "Bestseller" | "New" | "Sale" | "Artisanal";
    shortDescription?: string;
    features?: string[];
    dimensions?: string;
    materials?: string;
    care?: string;
    colors?: { name: string; hex: string }[];
    sizes?: string[];
    tags?: string[];
    [key: string]: unknown;
  } | null;
  created_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logo_url?: string | null;
  } | null;
  images?: Array<{
    id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }> | null;
  variants?: Array<{
    id: string;
    title: string;
    sku: string | null;
    price: number | string | null;
    compare_at_price: number | string | null;
    options: Record<string, string>;
  }> | null;
  inventory?: Array<{
    id: string;
    quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
  }> | null;
  reviews?: Array<{
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    is_verified_purchase: boolean;
    created_at: string;
    user_id: string;
    profile?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }> | null;
}

/**
 * Formats a raw Supabase database row into the strongly-typed Product model.
 */
export function mapDbProductToProduct(row: RawDbProduct): Product {
  const meta = row.metadata || {};
  
  // Sort and extract image URLs
  const rawImages = row.images ? [...row.images] : [];
  rawImages.sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const images = rawImages.length > 0
    ? rawImages.map((img) => img.url)
    : [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=1000",
      ];

  // Calculate inventory
  const inv = row.inventory?.[0];
  const totalQty = inv ? inv.quantity - inv.reserved_quantity : 15;
  const inStock = totalQty > 0;

  // Variants mapping
  const variants: ProductVariantItem[] = (row.variants || []).map((v) => ({
    id: v.id,
    title: v.title,
    sku: v.sku || undefined,
    price: v.price ? Number(v.price) : undefined,
    compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : undefined,
    options: v.options || {},
  }));

  // Reviews mapping
  const reviews: ProductReview[] = (row.reviews || []).map((r) => ({
    id: r.id,
    author: r.profile?.full_name || "Aura Collector",
    rating: Number(r.rating),
    date: new Date(r.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    title: r.title || "Mindful Craft",
    comment: r.comment,
    verified: r.is_verified_purchase,
    avatarUrl: r.profile?.avatar_url || undefined,
    userId: r.user_id,
  }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    category: row.category?.name || "Artisanal Ceramics",
    categorySlug: row.category?.slug || "ceramics",
    brandName: row.brand?.name || "Aura Studio",
    brandSlug: row.brand?.slug || "aura-earth",
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
    rating: Number(row.rating) || 5.0,
    reviewsCount: row.reviews_count || reviews.length,
    badge: meta.badge,
    images,
    description: row.description || "Mindfully handcrafted with natural elements.",
    shortDescription:
      meta.shortDescription ||
      (row.description ? row.description.slice(0, 110) + "..." : "Artisanal heirloom craft."),
    features: meta.features || [
      "Ethically sourced natural raw materials",
      "Handcrafted in small artisan studio batches",
      "Plastic-free recyclable paper packaging",
    ],
    dimensions: meta.dimensions || "Dimensions vary by handcrafted piece",
    materials: meta.materials || "Natural clay, untreated wood, organic botanicals",
    care: meta.care || "Gently wipe with a soft, clean lint-free cloth.",
    inStock,
    stockCount: totalQty,
    sku: row.sku || `AE-${row.id.slice(0, 6).toUpperCase()}`,
    colors: meta.colors,
    sizes: meta.sizes,
    tags: meta.tags || ["artisanal", "sustainable", "homeware"],
    variants,
    reviews,
  };
}

export class ProductService {
  private client: ReturnType<typeof createBrowserClient>;

  constructor(supabaseClient?: ReturnType<typeof createBrowserClient>) {
    this.client = supabaseClient || createBrowserClient();
  }

  /**
   * Fetches paginated, filtered, and sorted products from Supabase.
   */
  async getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    try {
      const {
        category,
        brand,
        search,
        minPrice,
        maxPrice,
        inStockOnly,
        minRating,
        sortBy = "featured",
        page = 1,
        limit = 12,
      } = filters;

      let query = this.client
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          description,
          price,
          compare_at_price,
          sku,
          is_active,
          is_featured,
          rating,
          reviews_count,
          metadata,
          created_at,
          category:categories(id, name, slug),
          brand:brands(id, name, slug),
          images:product_images(id, url, alt_text, sort_order, is_primary),
          variants:product_variants(id, title, sku, price, compare_at_price, options),
          inventory(id, quantity, reserved_quantity, low_stock_threshold),
          reviews(id, rating, title, comment, is_verified_purchase, created_at, user_id)
        `,
          { count: "exact" }
        )
        .eq("is_active", true);

      // Category filter
      if (category && category !== "all") {
        const { data: catData } = (await this.client
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single()) as { data: { id: string } | null; error: unknown };

        if (catData) {
          query = query.eq("category_id", catData.id);
        }
      }

      // Brand filter
      if (brand && brand !== "all") {
        const { data: brandData } = (await this.client
          .from("brands")
          .select("id")
          .eq("slug", brand)
          .single()) as { data: { id: string } | null; error: unknown };

        if (brandData) {
          query = query.eq("brand_id", brandData.id);
        }
      }

      // Price filter
      if (typeof minPrice === "number" && minPrice > 0) {
        query = query.gte("price", minPrice);
      }
      if (typeof maxPrice === "number" && maxPrice > 0) {
        query = query.lte("price", maxPrice);
      }

      // Rating filter
      if (typeof minRating === "number" && minRating > 0) {
        query = query.gte("rating", minRating);
      }

      // Search filter
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
      }

      // Sorting
      switch (sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price", { ascending: false });
          break;
        case "rating":
          query = query.order("rating", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "featured":
        default:
          query = query
            .order("is_featured", { ascending: false })
            .order("rating", { ascending: false });
          break;
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to local dataset if offline or empty
        return this.getFallbackProducts(filters);
      }

      let mappedProducts = (data as unknown as RawDbProduct[]).map(mapDbProductToProduct);

      // Availability filter in memory if needed
      if (inStockOnly) {
        mappedProducts = mappedProducts.filter((p) => p.inStock);
      }

      const totalCount = count ?? mappedProducts.length;

      return {
        products: mappedProducts,
        total: totalCount,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      };
    } catch {
      return this.getFallbackProducts(filters);
    }
  }

  /**
   * Fetches a single product by slug from Supabase, joining full details.
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data, error } = await this.client
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          description,
          price,
          compare_at_price,
          sku,
          is_active,
          is_featured,
          rating,
          reviews_count,
          metadata,
          created_at,
          category:categories(id, name, slug),
          brand:brands(id, name, slug),
          images:product_images(id, url, alt_text, sort_order, is_primary),
          variants:product_variants(id, title, sku, price, compare_at_price, options),
          inventory(id, quantity, reserved_quantity, low_stock_threshold),
          reviews(
            id,
            rating,
            title,
            comment,
            is_verified_purchase,
            created_at,
            user_id
          )
        `
        )
        .eq("slug", slug)
        .single();

      if (error || !data) {
        // Fallback to mock product
        const fallback = PRODUCTS.find((p) => p.slug === slug);
        return fallback || null;
      }

      const raw = data as unknown as RawDbProduct;

      // Enhance reviews with reviewer profile details
      if (raw.reviews && raw.reviews.length > 0) {
        const userIds = Array.from(new Set(raw.reviews.map((r) => r.user_id)));
        const { data: profiles } = (await this.client
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds)) as {
          data: Array<{ id: string; full_name: string | null; avatar_url: string | null }> | null;
          error: unknown;
        };

        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
        raw.reviews.forEach((r) => {
          const prof = profileMap.get(r.user_id);
          r.profile = prof || null;
        });
      }

      return mapDbProductToProduct(raw);
    } catch {
      const fallback = PRODUCTS.find((p) => p.slug === slug);
      return fallback || null;
    }
  }

  /**
   * Fetches all categories with active product count.
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data: categories, error } = (await this.client
        .from("categories")
        .select("id, name, slug, description, image_url")) as {
        data: Array<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
        }> | null;
        error: unknown;
      };

      if (error || !categories || categories.length === 0) {
        return CATEGORIES;
      }

      // Count products per category
      const { data: productCounts } = (await this.client
        .from("products")
        .select("category_id")
        .eq("is_active", true)) as {
        data: Array<{ category_id: string | null }> | null;
        error: unknown;
      };

      const countMap = new Map<string, number>();
      (productCounts || []).forEach((p) => {
        if (p.category_id) {
          countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
        }
      });

      return categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description || "",
        image:
          c.image_url ||
          "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        itemCount: countMap.get(c.id) || 0,
      }));
    } catch {
      return CATEGORIES;
    }
  }

  /**
   * Fetches all brands with active product count.
   */
  async getBrands(): Promise<Brand[]> {
    try {
      const { data: brands, error } = (await this.client
        .from("brands")
        .select("id, name, slug, description, logo_url, website")) as {
        data: Array<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          website: string | null;
        }> | null;
        error: unknown;
      };

      if (error || !brands || brands.length === 0) {
        return [
          { id: "b1", slug: "aura-earth", name: "Aura & Earth Atelier", itemCount: 3 },
          { id: "b2", slug: "studio-terracotta", name: "Studio Terracotta", itemCount: 2 },
          { id: "b3", slug: "kanso-woodworks", name: "Kanso Woodworks", itemCount: 1 },
          { id: "b4", slug: "lumina-botanica", name: "Lumina Botanica", itemCount: 2 },
        ];
      }

      const { data: productCounts } = (await this.client
        .from("products")
        .select("brand_id")
        .eq("is_active", true)) as {
        data: Array<{ brand_id: string | null }> | null;
        error: unknown;
      };

      const countMap = new Map<string, number>();
      (productCounts || []).forEach((p) => {
        if (p.brand_id) {
          countMap.set(p.brand_id, (countMap.get(p.brand_id) || 0) + 1);
        }
      });

      return brands.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description || undefined,
        logoUrl: b.logo_url || undefined,
        website: b.website || undefined,
        itemCount: countMap.get(b.id) || 0,
      }));
    } catch {
      return [
        { id: "b1", slug: "aura-earth", name: "Aura & Earth Atelier", itemCount: 3 },
        { id: "b2", slug: "studio-terracotta", name: "Studio Terracotta", itemCount: 2 },
        { id: "b3", slug: "kanso-woodworks", name: "Kanso Woodworks", itemCount: 1 },
        { id: "b4", slug: "lumina-botanica", name: "Lumina Botanica", itemCount: 2 },
      ];
    }
  }

  /**
   * Submits a customer review for a product.
   */
  async addReview(params: {
    productId: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<{ success: boolean; review?: ProductReview; error?: string }> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        return { success: false, error: "Please sign in to share your thoughts." };
      }

      // Check if user already submitted a review
      const { data: existing } = (await this.client
        .from("reviews")
        .select("id")
        .eq("product_id", params.productId)
        .eq("user_id", user.id)
        .maybeSingle()) as { data: { id: string } | null; error: unknown };

      let result: { id: string };
      if (existing) {
        // Update review
        const { data, error } = (await (this.client.from("reviews") as any)
          .update({
            rating: params.rating,
            title: params.title,
            comment: params.comment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single()) as { data: { id: string } | null; error: unknown };

        if (error || !data) throw error || new Error("Failed to update review");
        result = data;
      } else {
        // Insert review
        const { data, error } = (await (this.client.from("reviews") as any)
          .insert({
            product_id: params.productId,
            user_id: user.id,
            rating: params.rating,
            title: params.title,
            comment: params.comment,
            is_verified_purchase: true,
            is_published: true,
          })
          .select()
          .single()) as { data: { id: string } | null; error: unknown };

        if (error || !data) throw error || new Error("Failed to insert review");
        result = data;
      }

      // Fetch user profile name
      const { data: profile } = (await this.client
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()) as {
        data: { full_name: string | null; avatar_url: string | null } | null;
        error: unknown;
      };

      return {
        success: true,
        review: {
          id: result.id,
          author: profile?.full_name || "Verified Collector",
          rating: params.rating,
          date: "Just now",
          title: params.title,
          comment: params.comment,
          verified: true,
          avatarUrl: profile?.avatar_url || undefined,
          userId: user.id,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to post review.";
      return { success: false, error: msg };
    }
  }

  /**
   * Internal helper for fallback/offline filtering over mock-data.ts
   */
  private getFallbackProducts(filters: ProductFilters): PaginatedProducts {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStockOnly,
      minRating,
      sortBy = "featured",
      page = 1,
      limit = 12,
    } = filters;

    let list = [...PRODUCTS];

    if (category && category !== "all") {
      list = list.filter((p) => p.categorySlug === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (typeof minPrice === "number" && minPrice > 0) {
      list = list.filter((p) => p.price >= minPrice);
    }
    if (typeof maxPrice === "number" && maxPrice > 0) {
      list = list.filter((p) => p.price <= maxPrice);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    if (typeof minRating === "number" && minRating > 0) {
      list = list.filter((p) => p.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.reverse();
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.badge === "Bestseller" ? 1 : 0) - (a.badge === "Bestseller" ? 1 : 0));
        break;
    }

    const total = list.length;
    const from = (page - 1) * limit;
    const paginated = list.slice(from, from + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}

export const productService = new ProductService();
