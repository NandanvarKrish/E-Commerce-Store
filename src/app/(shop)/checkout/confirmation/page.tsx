"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Printer,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { orderService } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatters";
import type { Order } from "@/types/order.types";

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = React.useState<Order | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      const fetched = await orderService.getOrderById(orderId);
      setOrder(fetched);
      setIsLoading(false);
    }

    load();
  }, [orderId]);

  if (isLoading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-olive border-t-transparent" />
          <p className="font-mono text-xs text-muted-foreground">Retrieving order confirmation...</p>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-24 text-center max-w-md mx-auto">
        <div className="rounded-2xl border border-brand-forest/15 bg-brand-cornsilk/30 p-8 text-center space-y-4">
          <Package className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="font-editorial text-2xl text-brand-forest">Order Not Found</h2>
          <p className="text-xs text-muted-foreground">
            We could not locate this order reference in our sanctuary records.
          </p>
          <Button asChild className="bg-brand-forest text-brand-cornsilk">
            <Link href="/orders">View Order Sanctuary</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="pb-24">
      {/* Editorial Confirmation Banner */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-10 sm:py-16">
        <Container className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex h-14 w-14 rounded-full bg-brand-forest text-brand-cornsilk items-center justify-center shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <Badge variant="outline" className="font-mono text-xs border-brand-olive text-brand-olive px-3 py-1">
            Order Status: {order.status.toUpperCase()}
          </Badge>

          <h1 className="font-editorial text-3xl sm:text-5xl text-brand-forest font-light">
            Thank you for your order
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground font-mono">
            Order #{order.orderNumber} has been received in the master atelier. A detailed confirmation receipt has
            been dispatched to <strong className="text-brand-forest">{order.email}</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-brand-forest text-brand-cornsilk hover:bg-brand-olive gap-2">
              <Link href={`/orders/${order.id}`}>
                <span>Track Live Order</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.print()}
              className="gap-2 font-mono text-xs border-brand-forest/20"
            >
              <Printer className="h-4 w-4" />
              <span>Print Sanctuary Receipt</span>
            </Button>
          </div>
        </Container>
      </div>

      {/* Order Details & Summary Cards */}
      <Container className="pt-10 max-w-3xl mx-auto space-y-8">
        {/* Tracking & Timeline Quick Card */}
        <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-forest/10 pb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-brand-olive" />
              <h3 className="font-display text-base font-bold text-brand-forest">Fulfillment Details</h3>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Carrier: {order.carrier || "GreenEco Ground"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="rounded-lg bg-brand-forest/5 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase">Estimated Delivery</span>
              <span className="font-bold text-brand-forest text-sm">
                {order.estimatedDelivery || "In 3-5 Days"}
              </span>
            </div>

            <div className="rounded-lg bg-brand-forest/5 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase">Tracking Reference</span>
              <span className="font-bold text-brand-forest text-sm truncate block">
                {order.trackingNumber || "Pending Dispatch"}
              </span>
            </div>

            <div className="rounded-lg bg-brand-forest/5 p-3 space-y-1">
              <span className="text-muted-foreground block text-[10px] uppercase">Payment Status</span>
              <span className="font-bold text-brand-forest text-sm uppercase">
                {order.paymentStatus} (V1 Net 0)
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Order Review */}
        <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-6">
          <h3 className="font-display text-base font-bold text-brand-forest border-b border-brand-forest/10 pb-3">
            Reserved Crafts ({order.items.length})
          </h3>

          <div className="divide-y divide-brand-forest/10">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-brand-cornsilk/30 flex-shrink-0 border border-brand-forest/10">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400"}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-forest truncate">{item.productTitle}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Qty: {item.quantity} · {item.variantTitle || "Standard"}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-brand-forest">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>

          {/* Breakdown & Totals */}
          <div className="border-t border-brand-forest/10 pt-4 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? "FREE" : formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Tax</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount Applied</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-brand-forest/10 pt-3 flex justify-between text-base font-bold text-brand-forest">
              <span>Total Amount</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Destination */}
        <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-brand-forest font-bold mb-1">
            <MapPin className="h-4 w-4 text-brand-olive" />
            <span>Dispatched Destination</span>
          </div>
          <p className="text-brand-forest font-bold">{order.shippingAddress.fullName}</p>
          <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p className="text-muted-foreground">{order.shippingAddress.line2}</p>}
          <p className="text-muted-foreground">
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </p>
          {order.shippingAddress.phone && <p className="text-muted-foreground">Phone: {order.shippingAddress.phone}</p>}
        </div>

        {/* Action Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Button variant="ghost" asChild className="text-xs font-mono text-muted-foreground hover:text-brand-forest">
            <Link href="/products">
              <span>Continue Exploring Crafts</span>
            </Link>
          </Button>
          <Button asChild className="bg-brand-forest text-brand-cornsilk hover:bg-brand-olive text-xs">
            <Link href="/orders">View All Orders in Sanctuary</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
