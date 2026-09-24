import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/mock-data";

export interface CartItem {
  id: string; // unique item id combining productId + variants
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPercentage: number;
  addItem: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [
        // Default sample cart item to show realistic initial UI
        {
          id: "prod-1-Sunlit Clay-Standard (9.5\")",
          productId: "prod-1",
          slug: "ceramic-fluted-vase",
          name: "Fluted Ochre Ceramic Vase",
          price: 88,
          compareAtPrice: 110,
          image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600",
          quantity: 1,
          color: "Sunlit Clay",
          size: "Standard (9.5\")",
        },
      ],
      promoCode: null,
      discountPercentage: 0,

      addItem: (product, quantity = 1, color, size) => {
        const variantId = `${product.id}-${color || "default"}-${size || "default"}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === variantId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          set({ items: updated });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id: variantId,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                image: product.images[0],
                quantity,
                color,
                size,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [], promoCode: null, discountPercentage: 0 }),

      applyPromoCode: (code: string) => {
        const clean = code.trim().toUpperCase();
        if (clean === "AURA10" || clean === "EARTH10") {
          set({ promoCode: clean, discountPercentage: 10 });
          return { success: true, message: "10% mindful savings code applied!" };
        }
        if (clean === "WELCOME20") {
          set({ promoCode: clean, discountPercentage: 20 });
          return { success: true, message: "20% welcome discount applied!" };
        }
        return { success: false, message: "Invalid promo code. Try 'AURA10'" };
      },

      removePromoCode: () => set({ promoCode: null, discountPercentage: 0 }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        return (subtotal * get().discountPercentage) / 100;
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0 || subtotal >= 100) return 0;
        return 12;
      },

      getFinalTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: "aura_cart_storage",
    }
  )
);
