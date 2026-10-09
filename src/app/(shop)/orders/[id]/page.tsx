"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Printer,
  ShieldCheck,
  MapPin,
  CreditCard,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { orderService } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatters";
import type { Order, OrderTrackingStep } from "@/types/order.types";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = React.useState<Order | null>(null);
  const [steps, setSteps] = React.useState<OrderTrackingStep[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const fetched = await orderService.getOrderById(id);
      if (fetched) {
        setOrder(fetched);
        setSteps(orderService.getOrderTrackingSteps(fetched));
      }
      setIsLoading(false);
    }

    load();
  }, [id]);

  if (isLoading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-olive border-t-transparent" />
          <p className="font-mono text-xs text-muted-foreground">Retrieving order sanctuary records...</p>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-24 text-center max-w-md mx-auto">
        <div className="rounded-2xl border border-brand-forest/15 bg-brand-cornsilk/30 p-8 text-center space-y-4">
          <Package className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="font-editorial text-2xl text-brand-forest">Order Record Not Found</h2>
          <p className="text-xs text-muted-foreground">
            We could not locate this order in our sanctuary records.
          </p>
          <Button asChild className="bg-brand-forest text-brand-cornsilk">
            <Link href="/orders">Return to Orders</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6 sm:py-8">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Orders", href: "/orders" },
              { label: `#${order.orderNumber}` },
            ]}
            className="mb-2"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-light">
                  Order #{order.orderNumber}
                </h1>
                <Badge
                  variant={
                    order.status === "delivered"
                      ? "default"
                      : isCancelled
                      ? "destructive"
                      : "secondary"
                  }
                  className="font-mono text-xs uppercase"
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })} · Tracking: {order.trackingNumber || "Pending dispatch"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs font-mono border-brand-forest/20"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </Button>
              <Button variant="default" size="sm" asChild className="text-xs bg-brand-forest text-brand-cornsilk hover:bg-brand-olive">
                <Link href="/orders">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>All Orders</span>
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12 space-y-8 max-w-5xl mx-auto">
        {/* Order Tracking Timeline */}
        <section className="rounded-xl border border-brand-forest/15 bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-brand-forest/10 pb-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-brand-olive" />
              <h2 className="font-display text-lg font-bold text-brand-forest">
                Fulfillment & Tracking Timeline
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Carrier: {order.carrier || "GreenEco Ground"}
            </span>
          </div>

          {/* Stepper Display */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        step.isCompleted
                          ? "bg-brand-forest text-brand-cornsilk shadow-sm"
                          : step.isCurrent
                          ? "bg-brand-olive text-brand-cornsilk ring-4 ring-brand-olive/20 animate-pulse"
                          : "bg-brand-forest/10 text-muted-foreground"
                      }`}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold font-mono ${
                          step.isCompleted || step.isCurrent
                            ? "text-brand-forest"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </h4>
                      {step.date && (
                        <span className="text-[10px] font-mono text-brand-olive block">
                          {step.date}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-11">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Order Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items Table (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-display text-base font-bold text-brand-forest border-b border-brand-forest/10 pb-3">
                Crafts in this Shipment ({order.items.length})
              </h3>

              <div className="divide-y divide-brand-forest/10">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex items-center justify-between gap-4 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-brand-cornsilk/30 flex-shrink-0 border border-brand-forest/10">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=400"}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-brand-forest text-sm truncate font-sans">
                          {item.productTitle}
                        </p>
                        {item.variantTitle && (
                          <p className="text-muted-foreground">{item.variantTitle}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          SKU: {item.sku || "AE-CRAFT"} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-brand-forest text-sm block">
                        {formatCurrency(item.total)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatCurrency(item.price)} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Notes if present */}
            {order.notes && (
              <div className="rounded-xl border border-brand-forest/15 bg-brand-cornsilk/20 p-5 text-xs font-mono space-y-1">
                <span className="font-bold text-brand-forest uppercase tracking-wider text-[10px] block">
                  Delivery Notes & Instructions
                </span>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column: Address, Payment & Financial Summary */}
          <div className="space-y-6">
            {/* Delivery Destination */}
            <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-brand-forest font-bold mb-2">
                <MapPin className="h-4 w-4 text-brand-olive" />
                <span>Shipping Address</span>
              </div>
              <p className="font-bold text-brand-forest">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-muted-foreground">{order.shippingAddress.line2}</p>
              )}
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  Tel: {order.shippingAddress.phone}
                </p>
              )}
            </div>

            {/* Payment Method / Status */}
            <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-brand-forest font-bold mb-2">
                <CreditCard className="h-4 w-4 text-brand-olive" />
                <span>Payment Details</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-bold text-brand-forest">Direct Atelier Invoice (V1)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-3 text-xs font-mono">
              <h3 className="font-display text-sm font-bold text-brand-forest border-b border-brand-forest/10 pb-2">
                Order Total Breakdown
              </h3>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping ({order.shippingMethod || "Standard"})</span>
                <span>
                  {order.shippingCost === 0 ? "FREE" : formatCurrency(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax (8%)</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-brand-forest/10 pt-3 flex justify-between text-base font-bold text-brand-forest">
                <span>Total Amount</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
