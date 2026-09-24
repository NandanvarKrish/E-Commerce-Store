import type { Product } from "@/types/catalog.types";

export interface CartItem {
  id: string; // Database cart_item id (or composite client key for guests)
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  price: number; // Server-validated unit price
  compareAtPrice?: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  // Server-side inventory & status validation flags
  availableStock: number;
  isOutOfStock?: boolean;
  isInsufficientStock?: boolean;
  isDeleted?: boolean;
  isInvalidVariant?: boolean;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  hasErrors: boolean;
  errors: string[];
}
