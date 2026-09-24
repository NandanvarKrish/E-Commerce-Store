export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  avatarUrl?: string;
  userId?: string;
}

export interface ProductVariantItem {
  id: string;
  title: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  options: {
    color?: string;
    colorHex?: string;
    size?: string;
    [key: string]: string | undefined;
  };
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  brandName?: string;
  brandSlug?: string;
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
  variants?: ProductVariantItem[];
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

export interface Brand {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  itemCount?: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  minRating?: number;
  sortBy?: "featured" | "price-asc" | "price-desc" | "rating" | "newest";
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
