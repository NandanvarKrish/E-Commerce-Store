"use client";

import * as React from "react";
import Link from "next/link";
import { Package, Truck, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/utils/formatters";
import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/database.types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
};

export default function OrdersPage() {
  const [filter, setFilter] = React.useState<"all" | "pending" | "processing" | "delivered">("all");
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as OrderRow[]);
      }
      setIsLoading(false);
    }

    loadOrders();
  }, []);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

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
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Delivered", value: "delivered" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
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

        {/* Loading or Orders List */}
        {isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-muted-foreground">
            Retrieving orders from sanctuary database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            description="You don't have any orders matching the chosen status."
            actionLabel="Explore Catalog"
            onAction={() => window.location.href = "/products"}
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
                      <span className="font-bold text-brand-forest">#{order.order_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">DATE PLACED</span>
                      <span className="text-brand-forest">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">TOTAL AMOUNT</span>
                      <span className="font-bold text-brand-forest">
                        {formatCurrency(Number(order.total_amount))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={order.status === "delivered" ? "default" : "secondary"}
                      className="gap-1 font-mono text-xs capitalize"
                    >
                      {order.status === "delivered" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>{order.status}</span>
                    </Badge>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-2 border-b last:border-0 border-brand-forest/10"
                      >
                        <div>
                          <p className="font-medium text-sm text-brand-forest">{item.product_title}</p>
                          {item.variant_title && (
                            <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                          )}
                          <p className="text-xs font-mono text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-brand-forest">
                          {formatCurrency(Number(item.total))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Items processing</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
