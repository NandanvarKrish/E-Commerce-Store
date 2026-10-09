"use client";

import * as React from "react";
import Link from "next/link";
import { Package, Truck, ArrowRight, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/utils/formatters";
import { orderService } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/order.types";

export default function OrdersPage() {
  const [filter, setFilter] = React.useState<OrderStatus | "all">("all");
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadOrders = React.useCallback(async () => {
    setIsLoading(true);
    const data = await orderService.getOrders(filter);
    setOrders(data);
    setIsLoading(false);
  }, [filter]);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "default";
      case "confirmed":
      case "processing":
      case "shipped":
        return "secondary";
      case "cancelled":
      case "refunded":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Account", href: "/account" },
              { label: "Order Sanctuary" },
            ]}
            className="mb-2"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-light">
                Order Sanctuary
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-mono">
                Review past dispatches, tracking timelines, and itemized craft receipts
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadOrders}
              className="gap-1.5 text-xs font-mono border-brand-forest/20 self-start sm:self-center"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Records</span>
            </Button>
          </div>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-brand-forest/10 pb-4 overflow-x-auto no-scrollbar">
          {[
            { label: "All Orders", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
            { label: "Refunded", value: "refunded" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs whitespace-nowrap transition-colors ${
                filter === tab.value
                  ? "bg-brand-forest text-brand-cornsilk font-semibold shadow-sm"
                  : "bg-brand-forest/5 text-brand-forest hover:bg-brand-forest/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading or Orders List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-olive border-t-transparent mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground">
              Retrieving orders from sanctuary database...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You don't have any orders matching the chosen status."
            actionLabel="Explore Catalog"
            onAction={() => (window.location.href = "/products")}
            icon={<Package className="h-6 w-6 text-brand-forest/60" />}
          />
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-brand-forest/15 bg-card shadow-sm hover:border-brand-forest/30 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-forest/10 bg-brand-forest/5 p-4 sm:px-6 font-mono text-xs">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">ORDER NUMBER</span>
                      <span className="font-bold text-brand-forest text-sm">#{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">DATE PLACED</span>
                      <span className="text-brand-forest">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">TOTAL AMOUNT</span>
                      <span className="font-bold text-brand-forest">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="hidden sm:block">
                        <span className="text-muted-foreground block text-[10px]">TRACKING</span>
                        <span className="text-brand-olive">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getStatusBadgeVariant(order.status)}
                      className="gap-1 font-mono text-xs capitalize py-1 px-3"
                    >
                      {order.status === "delivered" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : order.status === "cancelled" || order.status === "refunded" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>{order.status}</span>
                    </Badge>

                    <Button asChild size="sm" className="bg-brand-forest text-brand-cornsilk hover:bg-brand-olive text-xs gap-1.5 h-8">
                      <Link href={`/orders/${order.id}`}>
                        <span>Track Order</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-4 sm:p-6 space-y-3">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-2 border-b last:border-0 border-brand-forest/10"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-brand-forest truncate">
                            {item.productTitle}
                          </p>
                          {item.variantTitle && (
                            <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                          )}
                          <p className="text-xs font-mono text-muted-foreground">
                            Qty: {item.quantity} · {formatCurrency(item.price)} each
                          </p>
                        </div>
                        <span className="font-mono text-sm font-bold text-brand-forest">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Order details processing...</p>
                  )}
                </div>

                {/* Footer preview */}
                <div className="px-4 sm:px-6 py-3 bg-brand-cornsilk/20 border-t border-brand-forest/10 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-brand-olive" />
                    <span>Carrier: {order.carrier || "GreenEco Ground Standard"}</span>
                  </div>
                  <span>Est. Delivery: {order.estimatedDelivery || "In 3-5 days"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
