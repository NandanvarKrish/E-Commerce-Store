"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Truck, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_ORDERS } from "@/data/mock-data";
import { formatCurrency } from "@/utils/formatters";

export default function OrdersPage() {
  const [filter, setFilter] = React.useState<"all" | "Processing" | "Delivered">("all");

  const filteredOrders =
    filter === "all" ? MOCK_ORDERS : MOCK_ORDERS.filter((o) => o.status === filter);

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Order History" },
            ]}
            className="mb-2"
          />
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-forest">
            Order Sanctuary
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Review past shipments, tracking status, and itemized receipts
          </p>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-brand-forest/10 pb-4">
          {[
            { label: "All Orders", value: "all" },
            { label: "Processing", value: "Processing" },
            { label: "Delivered", value: "Delivered" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as "all" | "Processing" | "Delivered")}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-colors ${
                filter === tab.value
                  ? "bg-brand-forest text-brand-cornsilk font-semibold shadow-sm"
                  : "bg-brand-forest/5 text-brand-forest hover:bg-brand-forest/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order Cards */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You don't have any orders matching the chosen status."
            actionLabel="View All Orders"
            onAction={() => setFilter("all")}
            icon={<Package className="h-6 w-6 text-brand-forest/60" />}
          />
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-brand-forest/15 bg-card shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-forest/10 bg-brand-forest/5 p-4 sm:px-6 font-mono text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">ORDER ID</span>
                      <span className="font-bold text-brand-forest">#{order.id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">DATE PLACED</span>
                      <span className="text-brand-forest">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">TOTAL AMOUNT</span>
                      <span className="font-bold text-brand-forest">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={order.status === "Delivered" ? "default" : "secondary"}
                      className="gap-1 font-mono text-xs"
                    >
                      {order.status === "Delivered" ? (
                        <CheckCircle2 className="h-3 w-3 text-brand-cornsilk" />
                      ) : (
                        <Clock className="h-3 w-3 text-brand-copper" />
                      )}
                      <span>{order.status}</span>
                    </Badge>
                  </div>
                </div>

                {/* Order Items List */}
                <div className="divide-y divide-brand-forest/10 p-4 sm:p-6 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
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
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono text-sm font-bold text-brand-forest">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Bottom Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-brand-forest/10 bg-brand-cornsilk/30 p-4 sm:px-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Truck className="h-4 w-4 text-brand-olive" />
                    <span>
                      Carrier: {order.carrier} (Tracking: {order.trackingNumber})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" asChild className="text-xs">
                      <Link href={`/orders/${order.id}`}>
                        <span>View Order Details</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
