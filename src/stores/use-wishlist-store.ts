import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/catalog.types";
import { wishlistService } from "@/services/wishlist.service";
import { useCartStore } from "@/stores/use-cart-store";

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  isSyncing: boolean;
  // Lifecycle
  init: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  // Actions
  toggleWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  moveToCart: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string
  ) => Promise<{ success: boolean; message?: string }>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,

      /**
       * Initializes wishlist from Supabase for authenticated users.
       */
      init: async () => {
        set({ isLoading: true });
        try {
          const serverItems = await wishlistService.getWishlist();
          if (serverItems.length > 0) {
            set({ items: serverItems, isLoading: false });
          } else {
            // Keep local guest items if any
            set({ isLoading: false });
          }
        } catch (err) {
          console.error("useWishlistStore.init error:", err);
          set({ isLoading: false });
        }
      },

      /**
       * Syncs wishlist with Supabase.
       */
      syncWithServer: async () => {
        set({ isSyncing: true });
        try {
          const serverItems = await wishlistService.getWishlist();
          if (serverItems.length > 0) {
            set({ items: serverItems });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      /**
       * Toggles item in wishlist with Supabase persistence.
       * Returns true if added, false if removed.
       */
      toggleWishlist: async (product: Product) => {
        const current = get().items;
        const exists = current.some((item) => item.id === product.id);

        if (exists) {
          // Optimistic remove
          set({ items: current.filter((item) => item.id !== product.id) });
          try {
            await wishlistService.removeFromWishlist(product.id);
          } catch (err) {
            console.error("Failed to remove from server wishlist:", err);
          }
          return false;
        } else {
          // Optimistic add
          set({ items: [product, ...current] });
          try {
            await wishlistService.toggleWishlist(product);
          } catch (err) {
            console.error("Failed to add to server wishlist:", err);
          }
          return true;
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      removeFromWishlist: async (productId: string) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
        try {
          await wishlistService.removeFromWishlist(productId);
        } catch (err) {
          console.error("Failed to remove from server wishlist:", err);
        }
      },

      /**
       * Moves an item from wishlist directly into the shopping cart.
       */
      moveToCart: async (product, quantity = 1, color, size) => {
        const cartStore = useCartStore.getState();
        const addResult = await cartStore.addItem(product, quantity, color, size);

        if (addResult.success) {
          // Remove from wishlist
          await get().removeFromWishlist(product.id);
        }

        return addResult;
      },

      clearWishlist: async () => {
        set({ items: [] });
        try {
          await wishlistService.clearWishlist();
        } catch (err) {
          console.error("Failed to clear server wishlist:", err);
        }
      },
    }),
    {
      name: "aura_wishlist_storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
