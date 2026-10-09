-- ==============================================================================
-- Aura & Earth - Checkout and Order Management Migration
-- Enhances orders table, order_status enum, and provides atomic place_order RPC
-- ==============================================================================

-- 1. Extend order_status enum with confirmed and refunded
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'public.order_status'::regtype 
      AND enumlabel = 'confirmed'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'confirmed' BEFORE 'processing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'public.order_status'::regtype 
      AND enumlabel = 'refunded'
  ) THEN
    ALTER TYPE public.order_status ADD VALUE 'refunded' AFTER 'cancelled';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add tracking and shipping details to public.orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS estimated_delivery text,
  ADD COLUMN IF NOT EXISTS shipping_method text DEFAULT 'standard';

-- 3. Indexes for fast order tracking and lookup
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- 4. Server-Side Atomic Place Order Function (Recalculates totals, verifies inventory & prices)
CREATE OR REPLACE FUNCTION public.place_order(
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_shipping_method text DEFAULT 'standard',
  p_shipping_cost numeric DEFAULT 0.00,
  p_notes text DEFAULT NULL,
  p_promo_code text DEFAULT NULL,
  p_discount_amount numeric DEFAULT 0.00
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_cart_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0.00;
  v_tax_amount numeric(10,2) := 0.00;
  v_total_amount numeric(10,2) := 0.00;
  v_item record;
  v_prod record;
  v_variant record;
  v_item_price numeric(10,2);
  v_item_total numeric(10,2);
  v_inv_available integer;
  v_carrier text;
  v_tracking_number text;
  v_estimated_delivery text;
  v_date_prefix text;
  v_random_suffix text;
BEGIN
  -- Authenticate caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order';
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;
  END IF;
  IF v_user_email IS NULL THEN
    v_user_email := 'customer@auraearth.com';
  END IF;

  -- Find user's active cart
  SELECT id INTO v_cart_id FROM public.carts WHERE user_id = v_user_id;
  IF v_cart_id IS NULL THEN
    RAISE EXCEPTION 'No active cart found for user';
  END IF;

  -- Check cart is not empty
  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE cart_id = v_cart_id) THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Generate human-friendly order number: AE-YYYYMMDD-XXXX
  v_date_prefix := to_char(now(), 'YYYYMMDD');
  v_random_suffix := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  v_order_number := 'AE-' || v_date_prefix || '-' || v_random_suffix;

  -- Carrier and delivery estimates
  IF p_shipping_method = 'express' THEN
    v_carrier := 'CarbonNeutral Express';
    v_estimated_delivery := to_char(now() + interval '2 days', 'Mon DD, YYYY');
  ELSIF p_shipping_method = 'white_glove' THEN
    v_carrier := 'Atelier White Glove Premier';
    v_estimated_delivery := to_char(now() + interval '4 days', 'Mon DD, YYYY');
  ELSE
    v_carrier := 'GreenEco Ground Standard';
    v_estimated_delivery := to_char(now() + interval '5 days', 'Mon DD, YYYY');
  END IF;
  v_tracking_number := 'TRK-' || upper(substr(md5(random()::text), 1, 8)) || '-US';

  -- Calculate subtotal by verifying live database prices and inventory
  FOR v_item IN 
    SELECT ci.id, ci.product_id, ci.variant_id, ci.quantity
    FROM public.cart_items ci
    WHERE ci.cart_id = v_cart_id
  LOOP
    -- Verify product is active
    SELECT id, title, price, is_active, sku
    INTO v_prod
    FROM public.products
    WHERE id = v_item.product_id;

    IF v_prod IS NULL OR NOT v_prod.is_active THEN
      RAISE EXCEPTION 'Product % is unavailable or deactivated', v_item.product_id;
    END IF;

    -- Base price
    v_item_price := v_prod.price;

    -- Check variant price if applicable
    IF v_item.variant_id IS NOT NULL THEN
      SELECT id, title, price, sku
      INTO v_variant
      FROM public.product_variants
      WHERE id = v_item.variant_id AND product_id = v_item.product_id;

      IF v_variant IS NOT NULL AND v_variant.price IS NOT NULL THEN
        v_item_price := v_variant.price;
      END IF;
    END IF;

    -- Check inventory
    SELECT (quantity - reserved_quantity)
    INTO v_inv_available
    FROM public.inventory
    WHERE product_id = v_item.product_id
      AND (
        (v_item.variant_id IS NULL AND variant_id IS NULL)
        OR variant_id = v_item.variant_id
      )
    LIMIT 1;

    IF v_inv_available IS NOT NULL AND v_inv_available < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient inventory for %: only % available', v_prod.title, v_inv_available;
    END IF;

    v_item_total := v_item_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Calculate tax (8%)
  v_tax_amount := round(v_subtotal * 0.08, 2);

  -- Calculate final total
  v_total_amount := greatest(0.00, v_subtotal + p_shipping_cost + v_tax_amount - p_discount_amount);

  -- Create Order record with confirmed status
  INSERT INTO public.orders (
    order_number,
    user_id,
    email,
    status,
    payment_status,
    currency,
    subtotal,
    shipping_cost,
    tax_amount,
    discount_amount,
    total_amount,
    shipping_address,
    billing_address,
    notes,
    carrier,
    tracking_number,
    estimated_delivery,
    shipping_method
  ) VALUES (
    v_order_number,
    v_user_id,
    v_user_email,
    'confirmed'::public.order_status,
    'pending'::public.payment_status,
    'USD',
    v_subtotal,
    p_shipping_cost,
    v_tax_amount,
    p_discount_amount,
    v_total_amount,
    p_shipping_address,
    coalesce(p_billing_address, p_shipping_address),
    p_notes,
    v_carrier,
    v_tracking_number,
    v_estimated_delivery,
    p_shipping_method
  ) RETURNING id INTO v_order_id;

  -- Create Order Items & Reserve Inventory
  FOR v_item IN 
    SELECT ci.product_id, ci.variant_id, ci.quantity
    FROM public.cart_items ci
    WHERE ci.cart_id = v_cart_id
  LOOP
    SELECT id, title, price, sku
    INTO v_prod
    FROM public.products
    WHERE id = v_item.product_id;

    v_item_price := v_prod.price;

    IF v_item.variant_id IS NOT NULL THEN
      SELECT id, title, price, sku
      INTO v_variant
      FROM public.product_variants
      WHERE id = v_item.variant_id;

      IF v_variant IS NOT NULL AND v_variant.price IS NOT NULL THEN
        v_item_price := v_variant.price;
      END IF;
    END IF;

    v_item_total := v_item_price * v_item.quantity;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      variant_id,
      product_title,
      variant_title,
      sku,
      price,
      quantity,
      total
    ) VALUES (
      v_order_id,
      v_item.product_id,
      v_item.variant_id,
      v_prod.title,
      v_variant.title,
      coalesce(v_variant.sku, v_prod.sku),
      v_item_price,
      v_item.quantity,
      v_item_total
    );

    -- Reserve / deduct inventory
    UPDATE public.inventory
    SET quantity = greatest(0, quantity - v_item.quantity),
        updated_at = now()
    WHERE product_id = v_item.product_id
      AND (
        (v_item.variant_id IS NULL AND variant_id IS NULL)
        OR variant_id = v_item.variant_id
      );
  END LOOP;

  -- Clear cart items
  DELETE FROM public.cart_items WHERE cart_id = v_cart_id;

  -- Create notification for user
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    link,
    type
  ) VALUES (
    v_user_id,
    'Order Confirmed: #' || v_order_number,
    'Your mindful craft order has been received and is being prepared in the atelier.',
    '/orders/' || v_order_id::text,
    'order_status'
  );

  -- Return created order details
  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', 'confirmed',
    'total_amount', v_total_amount,
    'subtotal', v_subtotal,
    'shipping_cost', p_shipping_cost,
    'tax_amount', v_tax_amount,
    'tracking_number', v_tracking_number,
    'carrier', v_carrier,
    'estimated_delivery', v_estimated_delivery
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, numeric, text, text, numeric) TO authenticated;
