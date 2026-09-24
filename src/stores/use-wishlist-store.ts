import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/mock-data";
import { PRODUCTS } from "@/data/mock-data";

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [PRODUCTS[1], PRODUCTS[3]], // Prepopulate 2 items for rich initial view

      toggleWishlist: (product) => {
        const current = get().items;
        const exists = current.some((item) => item.id === product.id);

        if (exists) {
          set({ items: current.filter((item) => item.id !== product.id) });
          return false;
        } else {
          set({ items: [...current, product] });
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "aura_wishlist_storage",
    }
  )
);
