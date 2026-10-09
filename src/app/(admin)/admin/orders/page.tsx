"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Filter, MoreHorizontal, ArrowRight, Truck, RefreshCw, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatters";
import type { Order, OrderStatus } from "@/types/order.types";

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    const data = await orderService.getAllOrdersForAdmin();
    setOrders(data);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      alert("Error updating order status: " + (err.message || "Unknown error"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-forest">
            Order Fulfillment Center
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Manage customer orders, update delivery milestones, and assign courier dispatch
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="gap-1.5 text-xs font-mono border-brand-forest/20 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      <div className="rounded-xl border border-brand-forest/15 bg-card shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-brand-forest/10 gap-4 flex-wrap bg-brand-forest/5">
          <div className="flex items-center gap-2 max-w-sm flex-1 bg-background rounded-lg px-3 py-1.5 border border-brand-forest/15">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID, customer name, email..."
              className="w-full bg-transparent text-xs font-mono text-brand-forest placeholder:text-muted-foreground outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-mono text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-brand-forest/20 bg-background px-3 py-1.5 text-xs font-mono text-brand-forest focus:outline-none"
            >
              <option value="all">All Statuses ({orders.length})</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-forest/5 text-muted-foreground border-b border-brand-forest/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4">Update Milestone</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Loading sanctuary order records...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No orders matching search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-forest/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-forest">
                      #{ord.orderNumber}
                      {ord.trackingNumber && (
                        <span className="block text-[10px] text-brand-olive font-normal">
                          {ord.trackingNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-brand-forest">{ord.shippingAddress.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{ord.email}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-forest">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          ord.status === "delivered"
                            ? "default"
                            : ord.status === "cancelled" || ord.status === "refunded"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] uppercase font-mono px-2 py-0.5"
                      >
                        {ord.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        disabled={updatingId === ord.id}
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className="rounded border border-brand-forest/20 bg-background px-2 py-1 text-[11px] font-mono text-brand-forest focus:outline-none"
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            Mark as {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 text-brand-olive hover:underline"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
