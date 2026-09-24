import { createClient } from "@/utils/supabase/client";
import { mapDbProductToProduct } from "@/services/product.service";
import { cartService } from "@/services/cart.service";
import type { Product } from "@/types/catalog.types";

export class WishlistService {
  private client = createClient();

  /**
   * Helper to retrieve or create the user's wishlist record.
   */
  private async getOrCreateWishlistId(userId: string): Promise<string> {
    const { data: existing } = (await this.client
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()) as { data: { id: string } | null; error: unknown };

    if (existing?.id) {
      return existing.id;
    }

    const { data: created, error } = (await (this.client.from("wishlists") as any)
      .insert({ user_id: userId, name: "My Wishlist" })
      .select("id")
      .single()) as { data: { id: string } | null; error: unknown };

    if (error || !created) {
      throw error || new Error("Failed to initialize user wishlist");
    }

    return created.id;
  }

  /**
   * Fetches the authenticated user's wishlist products from Supabase.
   */
  async getWishlist(): Promise<Product[]> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        return [];
      }

      const wishlistId = await this.getOrCreateWishlistId(user.id);

      const { data: rawItems, error } = (await this.client
        .from("wishlist_items")
        .select(
          `
          id,
          created_at,
          product:products (
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
            inventory(id, quantity, reserved_quantity, low_stock_threshold)
          )
        `
        )
        .eq("wishlist_id", wishlistId)
        .order("created_at", { ascending: false })) as {
        data: Array<{ id: string; product: any }> | null;
        error: unknown;
      };

      if (error || !rawItems) {
        return [];
      }

      // Filter out deleted/inactive products and format
      return rawItems
        .filter((item) => item.product && item.product.is_active)
        .map((item) => mapDbProductToProduct(item.product));
    } catch (err) {
      console.error("WishlistService.getWishlist error:", err);
      return [];
    }
  }

  /**
   * Toggles an item in the user's wishlist in Supabase.
   * Returns true if added, false if removed.
   */
  async toggleWishlist(product: Product): Promise<{ inWishlist: boolean }> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        return { inWishlist: false };
      }

      const wishlistId = await this.getOrCreateWishlistId(user.id);

      // Check if already in wishlist
      const { data: existing } = (await this.client
        .from("wishlist_items")
        .select("id")
        .eq("wishlist_id", wishlistId)
        .eq("product_id", product.id)
        .maybeSingle()) as { data: { id: string } | null; error: unknown };

      if (existing) {
        // Delete item
        await this.client.from("wishlist_items").delete().eq("id", existing.id);
        return { inWishlist: false };
      } else {
        // Insert item
        await (this.client.from("wishlist_items") as any).insert({
          wishlist_id: wishlistId,
          product_id: product.id,
        });
        return { inWishlist: true };
      }
    } catch (err) {
      console.error("WishlistService.toggleWishlist error:", err);
      return { inWishlist: false };
    }
  }

  /**
   * Removes an item from the wishlist in Supabase.
   */
  async removeFromWishlist(productId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) return;

      const wishlistId = await this.getOrCreateWishlistId(user.id);
      await this.client
        .from("wishlist_items")
        .delete()
        .eq("wishlist_id", wishlistId)
        .eq("product_id", productId);
    } catch (err) {
      console.error("WishlistService.removeFromWishlist error:", err);
    }
  }

  /**
   * Clears the entire wishlist for the authenticated user.
   */
  async clearWishlist(): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) return;

      const wishlistId = await this.getOrCreateWishlistId(user.id);
      await this.client.from("wishlist_items").delete().eq("wishlist_id", wishlistId);
    } catch (err) {
      console.error("WishlistService.clearWishlist error:", err);
    }
  }

  /**
   * Moves an item from wishlist to cart with server inventory validation.
   */
  async moveToCart(params: {
    productId: string;
    variantId?: string;
    quantity?: number;
  }): Promise<{ success: boolean; message?: string }> {
    const addResult = await cartService.addItem({
      productId: params.productId,
      variantId: params.variantId,
      quantity: params.quantity ?? 1,
    });

    if (addResult.success) {
      await this.removeFromWishlist(params.productId);
    }

    return addResult;
  }
}

export const wishlistService = new WishlistService();
