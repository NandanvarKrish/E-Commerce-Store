import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/catalog.types";
import type { CartItem } from "@/types/cart.types";
import { cartService } from "@/services/cart.service";

export type { CartItem };

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  promoCode: string | null;
  discountPercentage: number;
  // Lifecycle
  init: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  // Actions
  addItem: (
    product: Product,
    quantity?: number,
    color?: string,
    size?: string
  ) => Promise<{ success: boolean; message?: string }>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (
    id: string,
    quantity: number
  ) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getFinalTotal: () => number;
  hasOutOfStockItems: () => boolean;
  hasInsufficientStockItems: () => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,
      error: null,
      promoCode: null,
      discountPercentage: 0,

      /**
       * Initializes the cart store:
       * - If user is authenticated, syncs guest items into DB and loads DB cart.
       * - If guest, validates items against DB products and inventory.
       */
      init: async () => {
        set({ isLoading: true, error: null });
        try {
          const serverSummary = await cartService.getCart();

          if (serverSummary.items.length > 0) {
            // User is authenticated and has items in DB
            set({ items: serverSummary.items, isLoading: false });
          } else {
            // User might be a guest or have guest items to sync
            const currentGuestItems = get().items;
            if (currentGuestItems.length > 0) {
              // Try syncing with server (if authenticated, merges; if guest, validates)
              const synced = await cartService.syncGuestCart(currentGuestItems);
              if (synced.items.length > 0) {
                set({ items: synced.items, isLoading: false });
                return;
              }

              // Validate guest items against live DB
              const validated = await cartService.validateGuestItems(currentGuestItems);
              set({ items: validated.items, isLoading: false });
            } else {
              set({ items: [], isLoading: false });
            }
          }
        } catch (err) {
          console.error("useCartStore.init error:", err);
          set({ isLoading: false });
        }
      },

      /**
       * Syncs cart state with the Supabase database.
       */
      syncWithServer: async () => {
        set({ isSyncing: true });
        try {
          const serverSummary = await cartService.getCart();
          if (serverSummary.items.length > 0) {
            set({ items: serverSummary.items });
          } else if (get().items.length > 0) {
            const validated = await cartService.validateGuestItems(get().items);
            set({ items: validated.items });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      /**
       * Adds a product to the cart with inventory validation.
       */
      addItem: async (product, quantity = 1, color, size) => {
        // Resolve matching variant if applicable
        let matchedVariantId: string | undefined;
        let unitPrice = product.price;

        if (product.variants && product.variants.length > 0) {
          const match = product.variants.find((v) => {
            const colorMatch =
              !color ||
              v.options?.color?.toLowerCase() === color.toLowerCase() ||
              v.title.toLowerCase().includes(color.toLowerCase());
            const sizeMatch =
              !size ||
              v.options?.size?.toLowerCase() === size.toLowerCase() ||
              v.title.toLowerCase().includes(size.toLowerCase());
            return colorMatch && sizeMatch;
          });
          if (match) {
            matchedVariantId = match.id;
            if (match.price) unitPrice = match.price;
          }
        }

        const clientKey = `${product.id}-${color || "default"}-${size || "default"}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) => item.id === clientKey || (item.productId === product.id && item.variantId === matchedVariantId)
        );

        const currentQty = existingIndex > -1 ? currentItems[existingIndex].quantity : 0;
        const targetQty = currentQty + quantity;

        // Check studio inventory bounds
        const availableStock = product.stockCount;
        if (targetQty > availableStock) {
          return {
            success: false,
            message: `Only ${availableStock} units remaining in studio (you already have ${currentQty} in bag).`,
          };
        }

        // Optimistic UI update
        const optimisticItems = [...currentItems];
        if (existingIndex > -1) {
          optimisticItems[existingIndex] = {
            ...optimisticItems[existingIndex],
            quantity: targetQty,
            price: unitPrice,
            availableStock,
            isOutOfStock: false,
            isInsufficientStock: false,
          };
        } else {
          optimisticItems.push({
            id: clientKey,
            productId: product.id,
            variantId: matchedVariantId,
            slug: product.slug,
            name: product.name,
            price: unitPrice,
            compareAtPrice: product.compareAtPrice,
            image: product.images[0] || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600",
            quantity,
            color,
            size,
            availableStock,
            isOutOfStock: false,
            isInsufficientStock: false,
          });
        }
        set({ items: optimisticItems });

        // Database persistence
        try {
          const res = await cartService.addItem({
            productId: product.id,
            variantId: matchedVariantId,
            quantity,
          });

          if (!res.success) {
            // Roll back on rejection
            set({ items: currentItems });
            return res;
          }

          // Fetch fresh server state
          get().syncWithServer();
          return { success: true };
        } catch {
          return { success: true }; // Keep local optimistic state for guests
        }
      },

      /**
       * Updates the quantity of a line item, respecting inventory limits.
       */
      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return { success: true };
        }

        const currentItems = get().items;
        const targetItem = currentItems.find((i) => i.id === id);
        if (!targetItem) return { success: false, message: "Item not found" };

        // Check available stock
        let finalQty = quantity;
        let clampedMessage: string | undefined;

        if (quantity > targetItem.availableStock) {
          finalQty = targetItem.availableStock;
          clampedMessage = `Stock limited: clamped to studio maximum of ${finalQty}.`;
        }

        // Optimistic update
        set({
          items: currentItems.map((item) =>
            item.id === id ? { ...item, quantity: finalQty } : item
          ),
        });

        // Supabase persistence
        try {
          const res = await cartService.updateQuantity(id, finalQty);
          if (res.clampedQuantity) {
            set({
              items: get().items.map((item) =>
                item.id === id ? { ...item, quantity: res.clampedQuantity! } : item
              ),
            });
            return { success: true, message: res.message };
          }
          if (clampedMessage) {
            return { success: true, message: clampedMessage };
          }
          return { success: true };
        } catch {
          return { success: true };
        }
      },

      /**
       * Removes an item from the cart.
       */
      removeItem: async (id) => {
        const prev = get().items;
        set({ items: prev.filter((item) => item.id !== id) });

        try {
          await cartService.removeItem(id);
        } catch (err) {
          console.error("Failed to remove item from server cart:", err);
        }
      },

      /**
       * Clears all items from the cart.
       */
      clearCart: async () => {
        set({ items: [], promoCode: null, discountPercentage: 0 });
        try {
          await cartService.clearCart();
        } catch (err) {
          console.error("Failed to clear server cart:", err);
        }
      },

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
        return get().items.reduce((total, item) => {
          if (item.isOutOfStock || item.isDeleted) return total;
          return total + item.quantity;
        }, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          if (item.isOutOfStock || item.isDeleted) return sum;
          return sum + item.price * item.quantity;
        }, 0);
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

      hasOutOfStockItems: () => {
        return get().items.some((i) => i.isOutOfStock || i.isDeleted);
      },

      hasInsufficientStockItems: () => {
        return get().items.some((i) => i.isInsufficientStock);
      },
    }),
    {
      name: "aura_cart_storage",
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discountPercentage: state.discountPercentage,
      }),
    }
  )
);
