import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const metrics = [
    {
      title: "Gross Volume",
      value: "$14,892.40",
      change: "+12.4%",
      icon: TrendingUp,
      desc: "Compared to last month",
    },
    {
      title: "Active Orders",
      value: "48",
      change: "+4.1%",
      icon: ShoppingBag,
      desc: "8 pending fulfillment",
    },
    {
      title: "Catalog Products",
      value: "124",
      change: "+6",
      icon: Package,
      desc: "Across 6 categories",
    },
    {
      title: "Registered Customers",
      value: "1,208",
      change: "+18.2%",
      icon: Users,
      desc: "34 joined this week",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-forest">
            Executive Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time telemetry and management controls for Aura & Earth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-mono text-xs">
            Live Feed: Active
          </Badge>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="border-brand-forest/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-brand-forest/80">
                  {m.title}
                </CardTitle>
                <div className="h-8 w-8 rounded bg-brand-forest/5 flex items-center justify-center text-brand-forest">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-brand-forest">
                  {m.value}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-brand-olive font-mono">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{m.change}</span>
                  <span className="text-muted-foreground font-sans ml-1">
                    {m.desc}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales & Fulfillment Trajectory</CardTitle>
            <CardDescription>
              Volume tracking across store categories and peak periods.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-brand-forest/20 bg-brand-forest/5 p-6 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                [Analytics visualization component ready for integration]
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Readiness</CardTitle>
            <CardDescription>Database and infrastructure status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center pb-2 border-b border-brand-forest/10">
              <span className="text-muted-foreground">Supabase PostgreSQL</span>
              <Badge variant="default">CONNECTED</Badge>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-brand-forest/10">
              <span className="text-muted-foreground">Row-Level Security</span>
              <Badge variant="secondary">CONFIGURED</Badge>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-brand-forest/10">
              <span className="text-muted-foreground">Auth Session Handler</span>
              <Badge variant="default">ACTIVE</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gemini API Layer</span>
              <Badge variant="outline">PENDING</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
