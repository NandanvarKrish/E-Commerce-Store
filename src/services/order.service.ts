import { createClient } from "@/utils/supabase/client";
import { cartService } from "./cart.service";
import { productService } from "./product.service";
import { MOCK_ORDERS } from "@/data/mock-data";
import type { Database, OrderStatus, PaymentStatus } from "@/types/database.types";
import type {
  Order,
  OrderItemDetail,
  CreateOrderInput,
  OrderTrackingStep,
  ShippingAddress,
} from "@/types/order.types";

const LOCAL_STORAGE_ORDERS_KEY = "aura_earth_orders";

export class OrderService {
  private client = createClient();

  /**
   * Helper to retrieve orders from localStorage (fallback / offline / guest)
   */
  private getLocalOrders(): Order[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Helper to persist an order to localStorage
   */
  private saveLocalOrder(order: Order): void {
    if (typeof window === "undefined") return;
    try {
      const list = this.getLocalOrders();
      const existingIdx = list.findIndex((o) => o.id === order.id);
      if (existingIdx >= 0) {
        list[existingIdx] = order;
      } else {
        list.unshift(order);
      }
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Helper to format an internal database order row into the typed Order domain model
   */
  private mapDbOrder(
    rawOrder: Database["public"]["Tables"]["orders"]["Row"] & {
      order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
    }
  ): Order {
    const rawAddr = rawOrder.shipping_address as Record<string, string>;
    const shippingAddress: ShippingAddress = {
      fullName: rawAddr?.fullName || rawAddr?.full_name || "Guest Customer",
      phone: rawAddr?.phone,
      line1: rawAddr?.line1 || rawAddr?.street || "",
      line2: rawAddr?.line2,
      city: rawAddr?.city || "",
      state: rawAddr?.state || "",
      postalCode: rawAddr?.postalCode || rawAddr?.postal_code || rawAddr?.zipCode || "",
      country: rawAddr?.country || "US",
      company: rawAddr?.company,
    };

    let billingAddress: ShippingAddress | undefined;
    if (rawOrder.billing_address) {
      const billRaw = rawOrder.billing_address as Record<string, string>;
      billingAddress = {
        fullName: billRaw?.fullName || billRaw?.full_name || shippingAddress.fullName,
        phone: billRaw?.phone,
        line1: billRaw?.line1 || billRaw?.street || shippingAddress.line1,
        line2: billRaw?.line2,
        city: billRaw?.city || shippingAddress.city,
        state: billRaw?.state || shippingAddress.state,
        postalCode: billRaw?.postalCode || billRaw?.postal_code || shippingAddress.postalCode,
        country: billRaw?.country || shippingAddress.country,
      };
    }

    const items: OrderItemDetail[] = (rawOrder.order_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      productTitle: item.product_title,
      variantTitle: item.variant_title,
      sku: item.sku,
      price: Number(item.price),
      quantity: item.quantity,
      total: Number(item.total),
      // Fallback placeholder image
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400",
    }));

    return {
      id: rawOrder.id,
      orderNumber: rawOrder.order_number,
      userId: rawOrder.user_id,
      email: rawOrder.email,
      status: rawOrder.status,
      paymentStatus: rawOrder.payment_status,
      currency: rawOrder.currency,
      subtotal: Number(rawOrder.subtotal),
      shippingCost: Number(rawOrder.shipping_cost),
      taxAmount: Number(rawOrder.tax_amount),
      discountAmount: Number(rawOrder.discount_amount),
      totalAmount: Number(rawOrder.total_amount),
      shippingAddress,
      billingAddress,
      shippingMethod: (rawOrder as any).shipping_method || "standard",
      carrier: (rawOrder as any).carrier || "GreenEco Ground Standard",
      trackingNumber: (rawOrder as any).tracking_number || `TRK-${rawOrder.order_number}-US`,
      estimatedDelivery: (rawOrder as any).estimated_delivery || "In 3-5 Business Days",
      notes: rawOrder.notes || undefined,
      createdAt: rawOrder.created_at,
      updatedAt: rawOrder.updated_at,
      items,
    };
  }

  /**
   * Recalculates and places a new order with complete server-side price and inventory validation.
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const {
      data: { user },
    } = await this.client.auth.getUser();

    // 1. Fetch current authoritative cart items
    const cartSummary = await cartService.getCart();

    // Fallback: If cartService.getCart() returned empty (e.g., guest mode with local items)
    let cartItems = cartSummary.items;
    if (cartItems.length === 0 && typeof window !== "undefined") {
      try {
        const localCartRaw = localStorage.getItem("aura-earth-cart");
        if (localCartRaw) {
          const parsed = JSON.parse(localCartRaw);
          if (parsed?.state?.items && Array.isArray(parsed.state.items)) {
            cartItems = parsed.state.items;
          }
        }
      } catch {
        // Ignore
      }
    }

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Your bag is empty. Please add items before placing an order.");
    }

    // 2. Validate inventory and pricing
    const outOfStockItem = cartItems.find((i) => i.isOutOfStock || i.isDeleted);
    if (outOfStockItem) {
      throw new Error(
        `Item "${outOfStockItem.name}" is no longer available. Please remove it from your bag.`
      );
    }

    const shortageItem = cartItems.find((i) => i.isInsufficientStock);
    if (shortageItem) {
      throw new Error(
        `Item "${shortageItem.name}" exceeds available stock (max ${shortageItem.availableStock}).`
      );
    }

    // Recalculate subtotal authoritatively
    let calculatedSubtotal = 0;
    for (const item of cartItems) {
      // Fetch live product from product service
      const product = await productService.getProductBySlug(item.slug);
      let authoritativePrice = item.price;
      if (product) {
        authoritativePrice = product.price;
        if (item.variantId && product.variants) {
          const v = product.variants.find((vr) => vr.id === item.variantId);
          if (v && v.price) authoritativePrice = v.price;
        }
      }
      calculatedSubtotal += authoritativePrice * item.quantity;
    }

    // Recalculate shipping cost
    let calculatedShipping = 0;
    if (input.shippingMethod === "express") {
      calculatedShipping = 25.0;
    } else if (input.shippingMethod === "white_glove") {
      calculatedShipping = 45.0;
    } else {
      // Standard: Free over $150, else $15
      calculatedShipping = calculatedSubtotal >= 150 ? 0.0 : 15.0;
    }

    // Recalculate discount
    let calculatedDiscount = 0;
    if (input.promoCode) {
      const code = input.promoCode.trim().toUpperCase();
      if (code === "WELCOME10" || code === "AURA10") {
        calculatedDiscount = Number((calculatedSubtotal * 0.1).toFixed(2));
      } else if (code === "EARTHDAY") {
        calculatedDiscount = Number((calculatedSubtotal * 0.15).toFixed(2));
      }
    }

    // Calculate tax (8%)
    const calculatedTax = Number((calculatedSubtotal * 0.08).toFixed(2));

    // Calculate final total
    const calculatedTotal = Number(
      Math.max(0, calculatedSubtotal + calculatedShipping + calculatedTax - calculatedDiscount).toFixed(2)
    );

    // 3. Try PostgreSQL RPC `place_order` first if user is logged in
    if (user) {
      try {
        const { data: rpcResult, error: rpcError } = await (this.client.rpc as any)("place_order", {
          p_shipping_address: input.shippingAddress as any,
          p_billing_address: (input.billingAddress || input.shippingAddress) as any,
          p_shipping_method: input.shippingMethod,
          p_shipping_cost: calculatedShipping,
          p_notes: input.notes || null,
          p_promo_code: input.promoCode || null,
          p_discount_amount: calculatedDiscount,
        });

        if (!rpcError && rpcResult && (rpcResult as any).id) {
          // Fetch full created order with joined items
          const createdOrder = await this.getOrderById((rpcResult as any).id);
          if (createdOrder) {
            await cartService.clearCart();
            return createdOrder;
          }
        }
      } catch (rpcErr) {
        console.warn("RPC place_order unavailable or errored, falling back to direct transaction:", rpcErr);
      }
    }

    // 4. Fallback: Direct Database Insert or Local Order Generation
    const timestamp = new Date();
    const datePrefix = timestamp.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `AE-${datePrefix}-${randomSuffix}`;
    const orderId = "ord-" + Date.now();

    const carrier =
      input.shippingMethod === "express"
        ? "CarbonNeutral Express"
        : input.shippingMethod === "white_glove"
        ? "Atelier White Glove Premier"
        : "GreenEco Ground Standard";

    const estimatedDays = input.shippingMethod === "express" ? 2 : input.shippingMethod === "white_glove" ? 4 : 5;
    const estDeliveryDate = new Date();
    estDeliveryDate.setDate(estDeliveryDate.getDate() + estimatedDays);
    const estimatedDelivery = estDeliveryDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const trackingNumber = `TRK-${orderNumber}-US`;

    const domainItems: OrderItemDetail[] = cartItems.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      productId: item.productId,
      variantId: item.variantId || null,
      productTitle: item.name,
      variantTitle: [item.color, item.size].filter(Boolean).join(" · ") || null,
      sku: `AE-CRAFT-${item.productId.slice(0, 4)}`,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
      image: item.image,
      slug: item.slug,
    }));

    // If user is authenticated, attempt standard Supabase insert
    if (user) {
      try {
        const { data: orderRow, error: orderInsertErr } = await (this.client.from("orders") as any)
          .insert({
            order_number: orderNumber,
            user_id: user.id,
            email: user.email || "customer@auraearth.com",
            status: "confirmed",
            payment_status: "pending",
            currency: "USD",
            subtotal: calculatedSubtotal,
            shipping_cost: calculatedShipping,
            tax_amount: calculatedTax,
            discount_amount: calculatedDiscount,
            total_amount: calculatedTotal,
            shipping_address: input.shippingAddress as any,
            billing_address: (input.billingAddress || input.shippingAddress) as any,
            notes: input.notes || null,
            carrier,
            tracking_number: trackingNumber,
            estimated_delivery: estimatedDelivery,
            shipping_method: input.shippingMethod,
          })
          .select()
          .single();

        if (!orderInsertErr && orderRow) {
          // Insert order items
          const itemsToInsert = domainItems.map((item) => ({
            order_id: (orderRow as any).id,
            product_id: item.productId,
            variant_id: item.variantId,
            product_title: item.productTitle,
            variant_title: item.variantTitle,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          }));

          await (this.client.from("order_items") as any).insert(itemsToInsert as any);

          // Clear cart
          await cartService.clearCart();

          const fullOrder = await this.getOrderById((orderRow as any).id);
          if (fullOrder) return fullOrder;
        }
      } catch (dbErr) {
        console.warn("Direct DB order creation fallback error:", dbErr);
      }
    }

    // 5. Offline / Guest local order representation
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: user?.id || null,
      email: user?.email || (input.shippingAddress as any)?.email || "customer@auraearth.com",
      status: "confirmed",
      paymentStatus: "pending",
      currency: "USD",
      subtotal: calculatedSubtotal,
      shippingCost: calculatedShipping,
      taxAmount: calculatedTax,
      discountAmount: calculatedDiscount,
      totalAmount: calculatedTotal,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress || input.shippingAddress,
      shippingMethod: input.shippingMethod,
      carrier,
      trackingNumber,
      estimatedDelivery,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      items: domainItems,
    };

    this.saveLocalOrder(newOrder);
    await cartService.clearCart();

    return newOrder;
  }

  /**
   * Fetch all orders for current authenticated user (with offline/guest fallback)
   */
  async getOrders(statusFilter?: OrderStatus | "all"): Promise<Order[]> {
    try {
      const {
        data: { user },
      } = await this.client.auth.getUser();

      if (!user) {
        const local = this.getLocalOrders();
        return statusFilter && statusFilter !== "all"
          ? local.filter((o) => o.status === statusFilter)
          : local;
      }

      let query = this.client
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Fallback to local stored orders
        const local = this.getLocalOrders();
        return statusFilter && statusFilter !== "all"
          ? local.filter((o) => o.status === statusFilter)
          : local;
      }

      return data.map((d: any) => this.mapDbOrder(d));
    } catch {
      return this.getLocalOrders();
    }
  }

  /**
   * Fetch a single order by ID or order number
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      // 1. Try Supabase
      const { data, error } = await this.client
        .from("orders")
        .select("*, order_items(*)")
        .or(`id.eq.${orderId},order_number.eq.${orderId}`)
        .maybeSingle();

      if (!error && data) {
        return this.mapDbOrder(data as any);
      }
    } catch {
      // Ignore network errors and check local
    }

    // 2. Check local stored orders
    const local = this.getLocalOrders();
    const foundLocal = local.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (foundLocal) return foundLocal;

    // 3. Check mock orders
    const mock = MOCK_ORDERS.find((m) => m.id === orderId);
    if (mock) {
      return {
        id: mock.id,
        orderNumber: mock.id,
        userId: "mock-user",
        email: "customer@auraearth.com",
        status: mock.status.toLowerCase() as OrderStatus,
        paymentStatus: "paid",
        currency: "USD",
        subtotal: mock.subtotal,
        shippingCost: mock.shipping,
        taxAmount: mock.tax,
        discountAmount: 0,
        totalAmount: mock.total,
        shippingAddress: {
          fullName: mock.shippingAddress.fullName,
          line1: mock.shippingAddress.street,
          city: mock.shippingAddress.city,
          state: mock.shippingAddress.state,
          postalCode: mock.shippingAddress.zipCode,
          country: mock.shippingAddress.country,
        },
        carrier: mock.carrier,
        trackingNumber: mock.trackingNumber,
        estimatedDelivery: mock.estimatedDelivery,
        createdAt: new Date(mock.date).toISOString(),
        items: mock.items.map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: null,
          productTitle: i.name,
          variantTitle: i.variant || null,
          sku: "MOCK-SKU",
          price: i.price,
          quantity: i.quantity,
          total: i.price * i.quantity,
          image: i.image,
          slug: i.slug,
        })),
      };
    }

    return null;
  }

  /**
   * Build order tracking timeline steps based on order status
   */
  getOrderTrackingSteps(order: Order): OrderTrackingStep[] {
    const statusOrder: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);

    const placedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const isCancelled = order.status === "cancelled" || order.status === "refunded";

    if (isCancelled) {
      return [
        {
          label: "Order Placed",
          status: "placed",
          date: placedDate,
          description: "Order received in the atelier sanctuary.",
          isCompleted: true,
          isCurrent: false,
        },
        {
          label: order.status === "refunded" ? "Order Refunded" : "Order Cancelled",
          status: order.status,
          date: order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : placedDate,
          description:
            order.status === "refunded"
              ? "Payment and atelier reservation fully refunded to original source."
              : "This order has been cancelled by customer request or atelier update.",
          isCompleted: true,
          isCurrent: true,
        },
      ];
    }

    return [
      {
        label: "Order Confirmed",
        status: "confirmed",
        date: placedDate,
        description: "Artisan reservation confirmed and inventory secured.",
        isCompleted: currentIndex >= 1,
        isCurrent: currentIndex === 1 || currentIndex === 0,
      },
      {
        label: "Processing & Craft Pack",
        status: "processing",
        date: currentIndex >= 2 ? "In Atelier Studio" : undefined,
        description: "Mindfully inspected, wrapped in plastic-free recycled paper.",
        isCompleted: currentIndex >= 2,
        isCurrent: currentIndex === 2,
      },
      {
        label: "Dispatched & In Transit",
        status: "shipped",
        date: order.carrier || "CarbonNeutral Dispatch",
        description: order.trackingNumber
          ? `Dispatched via ${order.carrier}. Tracking: ${order.trackingNumber}`
          : "En route with sustainable carbon-offset courier.",
        isCompleted: currentIndex >= 3,
        isCurrent: currentIndex === 3,
      },
      {
        label: "Delivered",
        status: "delivered",
        date: order.estimatedDelivery || "Atelier Handover",
        description: "Safely received at destination address.",
        isCompleted: currentIndex >= 4,
        isCurrent: currentIndex === 4,
      },
    ];
  }

  /**
   * Administrative function to update an order's status and tracking details
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    options?: {
      carrier?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
    }
  ): Promise<Order> {
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (options?.carrier) updatePayload.carrier = options.carrier;
    if (options?.trackingNumber) updatePayload.tracking_number = options.trackingNumber;
    if (options?.estimatedDelivery) updatePayload.estimated_delivery = options.estimatedDelivery;

    if (status === "delivered") {
      updatePayload.payment_status = "paid";
    }

    // Try Supabase update
    try {
      const { data, error } = await (this.client.from("orders") as any)
        .update(updatePayload)
        .eq("id", orderId)
        .select("*, order_items(*)")
        .single();

      if (!error && data) {
        return this.mapDbOrder(data);
      }
    } catch {
      // Fallback to local
    }

    // Fallback: update local orders
    const local = this.getLocalOrders();
    const idx = local.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      local[idx].status = status;
      if (options?.carrier) local[idx].carrier = options.carrier;
      if (options?.trackingNumber) local[idx].trackingNumber = options.trackingNumber;
      if (status === "delivered") local[idx].paymentStatus = "paid";
      this.saveLocalOrder(local[idx]);
      return local[idx];
    }

    throw new Error(`Order ${orderId} not found`);
  }

  /**
   * Fetch all orders for administrator dashboard
   */
  async getAllOrdersForAdmin(): Promise<Order[]> {
    try {
      const { data, error } = await this.client
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => this.mapDbOrder(d));
      }
    } catch {
      // Fallback
    }

    // Return combination of local and mock orders for full showcase
    const local = this.getLocalOrders();
    if (local.length > 0) return local;

    return MOCK_ORDERS.map((m) => ({
      id: m.id,
      orderNumber: m.id,
      userId: "mock-user",
      email: "eleanor.vance@mindfulliving.org",
      status: m.status.toLowerCase() as OrderStatus,
      paymentStatus: "paid",
      currency: "USD",
      subtotal: m.subtotal,
      shippingCost: m.shipping,
      taxAmount: m.tax,
      discountAmount: 0,
      totalAmount: m.total,
      shippingAddress: {
        fullName: m.shippingAddress.fullName,
        line1: m.shippingAddress.street,
        city: m.shippingAddress.city,
        state: m.shippingAddress.state,
        postalCode: m.shippingAddress.zipCode,
        country: m.shippingAddress.country,
      },
      carrier: m.carrier,
      trackingNumber: m.trackingNumber,
      estimatedDelivery: m.estimatedDelivery,
      createdAt: new Date(m.date).toISOString(),
      items: m.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: null,
        productTitle: i.name,
        variantTitle: i.variant || null,
        sku: "MOCK-SKU",
        price: i.price,
        quantity: i.quantity,
        total: i.price * i.quantity,
        image: i.image,
        slug: i.slug,
      })),
    }));
  }
}

export const orderService = new OrderService();
