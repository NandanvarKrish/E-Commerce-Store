import { createClient } from "@/utils/supabase/client";
import type { CartItem, CartSummary } from "@/types/cart.types";

interface RawJoinedCartItem {
  id: string;
  quantity: number;
  product_id: string;
  variant_id: string | null;
  product?: {
    id: string;
    title: string;
    slug: string;
    price: number | string;
    compare_at_price: number | string | null;
    is_active: boolean;
    sku: string | null;
    images?: Array<{ url: string; is_primary: boolean; sort_order: number }> | null;
    inventory?: Array<{ quantity: number; reserved_quantity: number }> | null;
  } | null;
  variant?: {
    id: string;
    title: string;
    price: number | string | null;
    compare_at_price: number | string | null;
    options: Record<string, string>;
  } | null;
}

export class CartService {
  private client = createClient();

  /**
   * Helper to retrieve or create the user's cart record.
   */
  private async getOrCreateCartId(userId: string): Promise<string> {
    const { data: existing } = (await this.client
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()) as { data: { id: string } | null; error: unknown };

    if (existing?.id) {
      return existing.id;
    }

    // Insert new cart if not present
    const { data: created, error } = (await (this.client.from("carts") as any)
      .insert({ user_id: userId })
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (error || !created) {
      throw error || new Error("Failed to initialize user cart");
    }

    return created.id;
  }

  /**
   * Retrieves and validates the authenticated user's cart from Supabase.
   * If user is a guest, returns empty list (guest items are validated separately).
   */
  async getCart(): Promise<CartSummary> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        return { items: [], subtotal: 0, totalItems: 0, hasErrors: false, errors: [] };
      }

      const cartId = await this.getOrCreateCartId(user.id);

      const { data: rawItems, error } = (await this.client
        .from("cart_items")
        .select(
          `
          id,
          quantity,
          product_id,
          variant_id,
          product:products (
            id,
            title,
            slug,
            price,
            compare_at_price,
            is_active,
            sku,
            images:product_images (url, is_primary, sort_order),
            inventory (quantity, reserved_quantity)
          ),
          variant:product_variants (
            id,
            title,
            price,
            compare_at_price,
            options
          )
        `
        )
        .eq("cart_id", cartId)
        .order("created_at", { ascending: true })) as {
        data: RawJoinedCartItem[] | null;
        error: unknown;
      };

      if (error || !rawItems) {
        return { items: [], subtotal: 0, totalItems: 0, hasErrors: false, errors: [] };
      }

      const errors: string[] = [];
      const items: CartItem[] = rawItems.map((raw) => {
        const prod = raw.product;
        const variant = raw.variant;

        // 1. Check if product exists and is active
        if (!prod || !prod.is_active) {
          errors.push(`A product in your bag is no longer available.`);
          return {
            id: raw.id,
            productId: raw.product_id,
            variantId: raw.variant_id || undefined,
            slug: prod?.slug || "",
            name: prod?.title || "Discontinued Craft",
            price: 0,
            image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600",
            quantity: raw.quantity,
            availableStock: 0,
            isDeleted: true,
            isOutOfStock: true,
          };
        }

        // 2. Check if variant is valid
        const isInvalidVariant = raw.variant_id !== null && !variant;
        if (isInvalidVariant) {
          errors.push(`Variant for "${prod.title}" is no longer available.`);
        }

        // 3. Extract authoritative price
        const unitPrice = variant?.price ? Number(variant.price) : Number(prod.price);
        const compareAtPrice = variant?.compare_at_price
          ? Number(variant.compare_at_price)
          : prod.compare_at_price
          ? Number(prod.compare_at_price)
          : undefined;

        // 4. Calculate real-time available inventory
        const inv = prod.inventory?.[0];
        const availableStock = inv ? Math.max(0, inv.quantity - inv.reserved_quantity) : 10;
        const isOutOfStock = availableStock <= 0;
        const isInsufficientStock = raw.quantity > availableStock && !isOutOfStock;

        if (isOutOfStock) {
          errors.push(`"${prod.title}" is currently out of stock.`);
        } else if (isInsufficientStock) {
          errors.push(
            `"${prod.title}" has only ${availableStock} units left (you requested ${raw.quantity}).`
          );
        }

        // 5. Image sorting
        const rawImages = prod.images ? [...prod.images] : [];
        rawImages.sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return a.sort_order - b.sort_order;
        });
        const image = rawImages[0]?.url || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600";

        return {
          id: raw.id,
          productId: prod.id,
          variantId: variant?.id,
          slug: prod.slug,
          name: prod.title,
          price: unitPrice,
          compareAtPrice,
          image,
          quantity: raw.quantity,
          color: variant?.options?.color,
          size: variant?.options?.size,
          availableStock,
          isOutOfStock,
          isInsufficientStock,
          isInvalidVariant,
        };
      });

      const subtotal = items.reduce(
        (sum, item) => (item.isOutOfStock || item.isDeleted ? sum : sum + item.price * item.quantity),
        0
      );
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items,
        subtotal,
        totalItems,
        hasErrors: errors.length > 0,
        errors,
      };
    } catch (err) {
      console.error("CartService.getCart error:", err);
      return { items: [], subtotal: 0, totalItems: 0, hasErrors: false, errors: [] };
    }
  }

  /**
   * Adds an item to the authenticated user's cart in Supabase with inventory check.
   */
  async addItem(params: {
    productId: string;
    variantId?: string;
    quantity?: number;
  }): Promise<{ success: boolean; message?: string; item?: CartItem }> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      const qty = Math.max(1, params.quantity ?? 1);

      // Verify product and inventory in database
      const { data: prod } = (await this.client
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          price,
          compare_at_price,
          is_active,
          inventory (quantity, reserved_quantity),
          images:product_images (url, is_primary, sort_order)
        `
        )
        .eq("id", params.productId)
        .single()) as {
        data: {
          id: string;
          title: string;
          slug: string;
          price: number;
          compare_at_price: number | null;
          is_active: boolean;
          inventory: Array<{ quantity: number; reserved_quantity: number }>;
          images: Array<{ url: string; is_primary: boolean; sort_order: number }>;
        } | null;
        error: unknown;
      };

      if (!prod || !prod.is_active) {
        return { success: false, message: "This product is currently unavailable." };
      }

      // Check stock
      const inv = prod.inventory?.[0];
      const available = inv ? inv.quantity - inv.reserved_quantity : 10;
      if (available <= 0) {
        return { success: false, message: `"${prod.title}" is out of stock.` };
      }

      if (user) {
        const cartId = await this.getOrCreateCartId(user.id);

        // Check if item already in cart to verify cumulative quantity
        const { data: existingItem } = (await this.client
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cartId)
          .eq("product_id", prod.id)
          .maybeSingle()) as { data: { id: string; quantity: number } | null; error: unknown };

        const currentQty = existingItem ? existingItem.quantity : 0;
        const targetQty = currentQty + qty;

        if (targetQty > available) {
          return {
            success: false,
            message: `Cannot add ${qty} more. Only ${available} units available in studio (you have ${currentQty} in bag).`,
          };
        }

        // Upsert into cart_items
        const { data: upserted, error: upsertErr } = (await (this.client.from("cart_items") as any)
          .upsert(
            {
              cart_id: cartId,
              product_id: prod.id,
              variant_id: params.variantId || null,
              quantity: targetQty,
            },
            { onConflict: "cart_id, product_id, variant_id" }
          )
          .select()
          .single()) as { data: { id: string } | null; error: unknown };

        if (upsertErr || !upserted) {
          throw upsertErr || new Error("Failed to add item to bag");
        }
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add to bag";
      return { success: false, message: msg };
    }
  }

  /**
   * Updates an item's quantity in Supabase with inventory check.
   */
  async updateQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<{ success: boolean; message?: string; clampedQuantity?: number }> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        return { success: true };
      }

      if (quantity <= 0) {
        return this.removeItem(cartItemId);
      }

      // Check current item & stock in DB
      const { data: item } = (await this.client
        .from("cart_items")
        .select(
          `
          id,
          product:products (
            title,
            inventory (quantity, reserved_quantity)
          )
        `
        )
        .eq("id", cartItemId)
        .single()) as {
        data: {
          id: string;
          product: {
            title: string;
            inventory: Array<{ quantity: number; reserved_quantity: number }>;
          };
        } | null;
        error: unknown;
      };

      if (!item) {
        return { success: false, message: "Item not found in bag" };
      }

      const inv = item.product?.inventory?.[0];
      const available = inv ? Math.max(0, inv.quantity - inv.reserved_quantity) : 10;

      let finalQty = quantity;
      let clamped = false;

      if (available <= 0) {
        return { success: false, message: `"${item.product?.title}" is now out of stock.` };
      }

      if (quantity > available) {
        finalQty = available;
        clamped = true;
      }

      const { error } = await (this.client.from("cart_items") as any)
        .update({ quantity: finalQty })
        .eq("id", cartItemId);

      if (error) throw error;

      if (clamped) {
        return {
          success: true,
          clampedQuantity: finalQty,
          message: `Stock limited: quantity adjusted to studio maximum of ${finalQty}.`,
        };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update quantity";
      return { success: false, message: msg };
    }
  }

  /**
   * Removes an item from the cart in Supabase.
   */
  async removeItem(cartItemId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (user) {
        const { error } = await this.client.from("cart_items").delete().eq("id", cartItemId);
        if (error) throw error;
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove item";
      return { success: false, message: msg };
    }
  }

  /**
   * Clears the user's cart in Supabase.
   */
  async clearCart(): Promise<{ success: boolean }> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (user) {
        const cartId = await this.getOrCreateCartId(user.id);
        await this.client.from("cart_items").delete().eq("cart_id", cartId);
      }

      return { success: true };
    } catch (err) {
      console.error("CartService.clearCart error:", err);
      return { success: false };
    }
  }

  /**
   * Validates guest cart items against live Supabase database products & inventory.
   */
  async validateGuestItems(guestItems: CartItem[]): Promise<CartSummary> {
    if (guestItems.length === 0) {
      return { items: [], subtotal: 0, totalItems: 0, hasErrors: false, errors: [] };
    }

    try {
      const productIds = guestItems.map((i) => i.productId);
      const { data: dbProducts } = (await this.client
        .from("products")
        .select(
          `
          id,
          title,
          slug,
          price,
          compare_at_price,
          is_active,
          inventory (quantity, reserved_quantity),
          images:product_images (url, is_primary, sort_order)
        `
        )
        .in("id", productIds)) as {
        data: Array<{
          id: string;
          title: string;
          slug: string;
          price: number;
          compare_at_price: number | null;
          is_active: boolean;
          inventory: Array<{ quantity: number; reserved_quantity: number }>;
          images: Array<{ url: string; is_primary: boolean; sort_order: number }>;
        }> | null;
        error: unknown;
      };

      const prodMap = new Map((dbProducts || []).map((p) => [p.id, p]));
      const errors: string[] = [];

      const validated: CartItem[] = guestItems.map((item) => {
        const prod = prodMap.get(item.productId);

        if (!prod || !prod.is_active) {
          errors.push(`"${item.name}" is no longer available.`);
          return {
            ...item,
            availableStock: 0,
            isDeleted: true,
            isOutOfStock: true,
          };
        }

        const inv = prod.inventory?.[0];
        const availableStock = inv ? Math.max(0, inv.quantity - inv.reserved_quantity) : 10;
        const isOutOfStock = availableStock <= 0;
        const isInsufficientStock = item.quantity > availableStock && !isOutOfStock;

        if (isOutOfStock) {
          errors.push(`"${prod.title}" is out of stock.`);
        } else if (isInsufficientStock) {
          errors.push(
            `"${prod.title}" has only ${availableStock} units remaining (you requested ${item.quantity}).`
          );
        }

        return {
          ...item,
          price: Number(prod.price), // Authoritative price from DB
          compareAtPrice: prod.compare_at_price ? Number(prod.compare_at_price) : undefined,
          availableStock,
          isOutOfStock,
          isInsufficientStock,
        };
      });

      const subtotal = validated.reduce(
        (sum, item) => (item.isOutOfStock || item.isDeleted ? sum : sum + item.price * item.quantity),
        0
      );
      const totalItems = validated.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: validated,
        subtotal,
        totalItems,
        hasErrors: errors.length > 0,
        errors,
      };
    } catch {
      return {
        items: guestItems,
        subtotal: guestItems.reduce((s, i) => s + i.price * i.quantity, 0),
        totalItems: guestItems.reduce((s, i) => s + i.quantity, 0),
        hasErrors: false,
        errors: [],
      };
    }
  }

  /**
   * Merges guest cart items into the authenticated user's cart in Supabase.
   */
  async syncGuestCart(guestItems: CartItem[]): Promise<CartSummary> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    if (!user || guestItems.length === 0) {
      return this.getCart();
    }

    try {
      const cartId = await this.getOrCreateCartId(user.id);

      // Upsert each valid guest item into cart_items
      for (const item of guestItems) {
        if (!item.isDeleted && !item.isOutOfStock) {
          await (this.client.from("cart_items") as any).upsert(
            {
              cart_id: cartId,
              product_id: item.productId,
              variant_id: item.variantId || null,
              quantity: item.quantity,
            },
            { onConflict: "cart_id, product_id, variant_id" }
          );
        }
      }

      return this.getCart();
    } catch (err) {
      console.error("CartService.syncGuestCart error:", err);
      return this.getCart();
    }
  }
}

export const cartService = new CartService();
