import Image from "next/image";
import { Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_USER, MOCK_ORDERS } from "@/data/mock-data";

export default function AdminCustomersPage() {
  const customers = [
    {
      ...MOCK_USER,
      id: "CUST-001",
      ordersCount: MOCK_ORDERS.length,
      totalSpend: 436.32,
      tier: "Artisan Patron",
    },
    {
      id: "CUST-002",
      name: "Marcus Vance",
      email: "marcus.v@studiobotanica.com",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
      memberSince: "March 2025",
      phone: "+1 (415) 332-9018",
      ordersCount: 3,
      totalSpend: 312.0,
      tier: "Sanctuary Member",
    },
    {
      id: "CUST-003",
      name: "Camille Laurent",
      email: "camille@atelierlaurent.fr",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
      memberSince: "July 2025",
      phone: "+33 6 42 19 88 01",
      ordersCount: 5,
      totalSpend: 680.5,
      tier: "Artisan Patron",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-forest">
            Customer Directory
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage customer relationships, lifetime engagement, and shipping profiles
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-brand-forest/15 bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-brand-forest/10 gap-4">
          <div className="flex items-center gap-2 max-w-sm flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer name or email..."
              className="w-full bg-transparent text-xs font-mono text-brand-forest placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-forest/5 text-muted-foreground border-b border-brand-forest/10 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-forest/10">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-brand-forest/5 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-brand-forest/5 flex-shrink-0">
                      <Image
                        src={c.avatarUrl}
                        alt={c.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-brand-forest">{c.name}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{c.email}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.memberSince}</td>
                  <td className="py-3 px-4">{c.ordersCount} orders</td>
                  <td className="py-3 px-4 font-bold text-brand-forest">
                    ${c.totalSpend.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary" className="text-[10px]">
                      {c.tier}
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
