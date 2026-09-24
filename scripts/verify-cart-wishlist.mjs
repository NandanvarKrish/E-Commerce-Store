import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://izyjxrdferuxoickwuga.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_SSjKm29Ujs7uxr5XFzty4A_7wZDP7SY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log("=== Aura & Earth Cart and Wishlist Verification ===");

  // 1. Authenticate demo customer
  console.log("\n1. Signing in as demo customer...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "customer@auraearth.com",
    password: "Password123!",
  });
  assert(!authError, `Auth failed: ${authError?.message}`);
  const user = authData.user;
  assert(user, "User should be authenticated");
  console.log(`✓ Authenticated as: ${user.email} (${user.id})`);

  // 2. Query available products and inventory
  console.log("\n2. Fetching active product with variants and inventory...");
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select(`
      id,
      title,
      price,
      is_active,
      variants:product_variants (id, title, price),
      inventory (quantity, reserved_quantity)
    `)
    .eq("is_active", true)
    .limit(2);

  assert(!prodError, `Product fetch failed: ${prodError?.message}`);
  assert(products && products.length > 0, "No active products found");
  const testProduct = products[0];
  const testVariant = testProduct.variants?.[0] || null;
  const inv = testProduct.inventory?.[0] || { quantity: 10, reserved_quantity: 0 };
  const availableStock = inv.quantity - inv.reserved_quantity;

  console.log(`✓ Selected Product: "${testProduct.title}" (ID: ${testProduct.id})`);
  console.log(`  Variant: ${testVariant ? testVariant.title : "None"}`);
  console.log(`  Available Stock: ${availableStock}`);

  // 3. Ensure user cart exists
  console.log("\n3. Ensuring user cart exists...");
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error: createCartErr } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    assert(!createCartErr, `Create cart failed: ${createCartErr?.message}`);
    cart = newCart;
  }
  console.log(`✓ Cart ID: ${cart.id}`);

  // Clean out any existing items for a clean test
  await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  // 4. Cart Add Item
  console.log("\n4. Testing cart add item...");
  const { data: addedItem, error: addErr } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cart.id,
      product_id: testProduct.id,
      variant_id: testVariant ? testVariant.id : null,
      quantity: 1,
    })
    .select()
    .single();

  assert(!addErr, `Add to cart failed: ${addErr?.message}`);
  assert(addedItem.quantity === 1, "Added item quantity should be 1");
  console.log(`✓ Added item to cart: Item ID ${addedItem.id}, qty: ${addedItem.quantity}`);

  // 5. Cart Update Quantity
  console.log("\n5. Testing cart quantity update...");
  const newQty = Math.min(3, availableStock);
  const { data: updatedItem, error: updateErr } = await supabase
    .from("cart_items")
    .update({ quantity: newQty })
    .eq("id", addedItem.id)
    .select()
    .single();

  assert(!updateErr, `Update quantity failed: ${updateErr?.message}`);
  assert.equal(updatedItem.quantity, newQty, `Quantity should be updated to ${newQty}`);
  console.log(`✓ Updated quantity to: ${updatedItem.quantity}`);

  // 6. Test RLS / Source of Truth: query cart items with joins
  console.log("\n6. Validating cart query with joined product & inventory...");
  const { data: fullCartItems, error: fullCartErr } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      product:products (id, title, price, is_active),
      variant:product_variants (id, title, price)
    `)
    .eq("cart_id", cart.id);

  assert(!fullCartErr, `Cart items query failed: ${fullCartErr?.message}`);
  assert.equal(fullCartItems.length, 1, "Should have exactly 1 cart item");
  assert.equal(fullCartItems[0].product.id, testProduct.id);
  console.log(`✓ Cart item verified: "${fullCartItems[0].product.title}", qty: ${fullCartItems[0].quantity}`);

  // 7. Ensure wishlist exists
  console.log("\n7. Ensuring user wishlist exists...");
  let { data: wishlist } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!wishlist) {
    const { data: newWishlist, error: createWishErr } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    assert(!createWishErr, `Create wishlist failed: ${createWishErr?.message}`);
    wishlist = newWishlist;
  }
  console.log(`✓ Wishlist ID: ${wishlist.id}`);

  // Clean wishlist items
  await supabase.from("wishlist_items").delete().eq("wishlist_id", wishlist.id);

  // 8. Wishlist Add Item (Second product if available, else first)
  const wishProduct = products[1] || products[0];
  console.log(`\n8. Adding product "${wishProduct.title}" to wishlist...`);
  const { data: wishItem, error: wishAddErr } = await supabase
    .from("wishlist_items")
    .insert({
      wishlist_id: wishlist.id,
      product_id: wishProduct.id,
    })
    .select()
    .single();

  assert(!wishAddErr, `Add to wishlist failed: ${wishAddErr?.message}`);
  console.log(`✓ Added to wishlist: Item ID ${wishItem.id}`);

  // 9. Move Item from Wishlist to Cart
  console.log("\n9. Testing move from wishlist to cart...");
  // Add to cart
  const { error: moveAddErr } = await supabase
    .from("cart_items")
    .upsert(
      {
        cart_id: cart.id,
        product_id: wishProduct.id,
        variant_id: null,
        quantity: 1,
      },
      { onConflict: "cart_id, product_id, variant_id" }
    );
  assert(!moveAddErr, `Move to cart (insert) failed: ${moveAddErr?.message}`);

  // Remove from wishlist
  const { error: moveDelErr } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", wishItem.id);
  assert(!moveDelErr, `Move to cart (delete from wishlist) failed: ${moveDelErr?.message}`);

  // Verify wishlist is now empty
  const { data: remainingWish } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlist.id);
  assert.equal(remainingWish.length, 0, "Wishlist should now be empty");
  console.log("✓ Wishlist item successfully moved to cart and removed from wishlist");

  // 10. Clean up test cart items
  console.log("\n10. Cleaning up test cart...");
  const { error: clearCartErr } = await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id);
  assert(!clearCartErr, `Clear cart failed: ${clearCartErr?.message}`);

  const { data: emptyCart } = await supabase
    .from("cart_items")
    .select("id")
    .eq("cart_id", cart.id);
  assert.equal(emptyCart.length, 0, "Cart should now be completely empty");
  console.log("✓ Cart cleared successfully");

  console.log("\n=======================================================");
  console.log("🎉 ALL CART AND WISHLIST ASSERTIONS PASSED SUCCESSFULLY");
  console.log("=======================================================");
}

run().catch((err) => {
  console.error("\n❌ Verification Failed:", err);
  process.exit(1);
});
