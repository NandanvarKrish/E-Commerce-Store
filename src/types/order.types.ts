import type { OrderStatus, PaymentStatus } from "./database.types";

export type { OrderStatus, PaymentStatus };

export interface ShippingAddress {
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  company?: string;
}

export type ShippingMethodId = "standard" | "express" | "white_glove";

export interface ShippingOption {
  id: ShippingMethodId;
  name: string;
  price: number;
  estimatedDelivery: string;
  description: string;
}

export interface OrderItemDetail {
  id: string;
  productId: string | null;
  variantId: string | null;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
  image?: string;
  slug?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod?: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDetail[];
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod: ShippingMethodId;
  shippingCost: number;
  notes?: string;
  promoCode?: string;
  discountAmount?: number;
}

export interface OrderTrackingStep {
  label: string;
  status: OrderStatus | "placed";
  date?: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
}
