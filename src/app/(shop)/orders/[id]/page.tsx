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
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MOCK_ORDERS } from "@/data/mock-data";
import { formatCurrency } from "@/utils/formatters";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const order = MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0];

  if (!order) {
    return notFound();
  }

  const steps = [
    { label: "Order Confirmed", date: order.date, done: true },
    { label: "Processing & Craft Pack", date: "Sep 22, 2026", done: true },
    {
      label: "In Transit",
      date: order.carrier,
      done: order.status === "Delivered" || order.status === "Shipped",
    },
    {
      label: "Delivered",
      date: order.estimatedDelivery,
      done: order.status === "Delivered",
    },
  ];

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Orders", href: "/orders" },
              { label: `#${order.id}` },
            ]}
            className="mb-2"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-3xl font-bold tracking-tight text-brand-forest">
                  Order #{order.id}
                </h1>
                <Badge
                  variant={order.status === "Delivered" ? "default" : "secondary"}
                  className="font-mono text-xs"
                >
                  {order.status}
                </Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                Placed on {order.date} · Tracking: {order.trackingNumber}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs font-mono"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Receipt</span>
              </Button>
              <Button variant="default" size="sm" asChild className="text-xs">
                <Link href="/orders">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Back to Orders</span>
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12 space-y-10">
        {/* Visual Fulfillment Tracker */}
        <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">
            Fulfillment Journey
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors mb-2 z-10 ${
                    step.done
                      ? "border-brand-olive bg-brand-olive text-brand-cornsilk shadow-sm"
                      : "border-brand-forest/20 bg-card text-muted-foreground"
                  }`}
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <span className="font-semibold text-xs text-brand-forest">{step.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                  {step.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Items & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Purchased Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="font-display text-xl font-bold text-brand-forest">
              Purchased Objects ({order.items.length})
            </h3>

            <div className="divide-y divide-brand-forest/10 rounded-xl border border-brand-forest/15 bg-card overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5 items-center">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-semibold text-brand-forest hover:text-brand-olive transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="font-mono text-xs text-muted-foreground mt-0.5">
                        {item.variant}
                      </p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="text-right font-mono text-sm font-bold text-brand-forest">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Billing Summary */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-brand-forest/15 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-copper" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground leading-relaxed">
                <p className="font-medium text-brand-forest">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </CardContent>
            </Card>

            <Card className="border-brand-forest/15 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand-olive" />
                  <span>Payment & Receipt</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping ({order.carrier})</span>
                  <span>{order.shipping === 0 ? "Complimentary" : formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-brand-forest/10 font-bold text-sm text-brand-forest">
                  <span>Total Paid</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
