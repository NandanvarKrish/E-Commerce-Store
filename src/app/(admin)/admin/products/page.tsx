import Image from "next/image";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS } from "@/data/mock-data";
import { formatCurrency } from "@/utils/formatters";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-forest">
            Product Catalog Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage inventory, pricing, variant configurations, and publishing state
          </p>
        </div>
        <Button size="sm" className="gap-1.5 self-start">
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-brand-forest/15 bg-card shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-brand-forest/10 gap-4 flex-wrap">
          <div className="flex items-center gap-2 max-w-sm flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by SKU or title..."
              className="w-full bg-transparent text-xs font-mono text-brand-forest placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs font-mono gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Category</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs font-mono gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-forest/5 text-muted-foreground border-b border-brand-forest/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {PRODUCTS.map((prod) => (
                <tr key={prod.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md bg-brand-forest/5 flex-shrink-0">
                      <Image
                        src={prod.images[0]}
                        alt={prod.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-brand-forest line-clamp-1">
                      {prod.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{prod.sku}</td>
                  <td className="py-3 px-4 text-muted-foreground">{prod.category}</td>
                  <td className="py-3 px-4 font-bold text-brand-forest">
                    {formatCurrency(prod.price)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={
                        prod.stockCount <= 8
                          ? "text-brand-copper font-bold"
                          : "text-brand-forest"
                      }
                    >
                      {prod.stockCount} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="default" className="text-[10px]">
                      Published
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="p-1 text-muted-foreground hover:text-brand-forest">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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
