import Link from "next/link";
import { Search, Filter, MoreHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_ORDERS } from "@/data/mock-data";
import { formatCurrency } from "@/utils/formatters";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-forest">
            Order Fulfillment Center
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage customer orders, track dispatching, and process returns
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-forest/15 bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-brand-forest/10 gap-4 flex-wrap">
          <div className="flex items-center gap-2 max-w-sm flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              className="w-full bg-transparent text-xs font-mono text-brand-forest placeholder:text-muted-foreground outline-none"
            />
          </div>
          <Button variant="outline" size="sm" className="text-xs font-mono gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Status: All</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-forest/5 text-muted-foreground border-b border-brand-forest/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {MOCK_ORDERS.map((ord) => (
                <tr key={ord.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-brand-forest">#{ord.id}</td>
                  <td className="py-3 px-4 text-muted-foreground">{ord.date}</td>
                  <td className="py-3 px-4 font-medium text-brand-forest">
                    {ord.shippingAddress.fullName}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{ord.items.length} units</td>
                  <td className="py-3 px-4 font-bold text-brand-forest">
                    {formatCurrency(ord.total)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={ord.status === "Delivered" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {ord.status}
                    </Badge>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
