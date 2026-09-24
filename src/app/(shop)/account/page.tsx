"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Shield,
  LogOut,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MOCK_USER, MOCK_ORDERS } from "@/data/mock-data";
import { createClient } from "@/utils/supabase/client";

export default function AccountPage() {
  const [user, setUser] = React.useState(MOCK_USER);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser?.email) {
        setUser((prev) => ({
          ...prev,
          email: authUser.email || prev.email,
          name: authUser.user_metadata?.full_name || prev.name,
        }));
      }
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="pb-24">
      {/* Top Banner */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs items={[{ label: "Account" }]} className="mb-2" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-forest">
            Account Sanctuary
          </h1>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-brand-forest/15 shadow-sm">
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-brand-olive/30 shadow-md">
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-brand-forest">
                    {user.name}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px] font-mono">
                    Member since {user.memberSince}
                  </Badge>
                </div>

                <div className="pt-4 border-t border-brand-forest/10 space-y-2 text-left text-xs font-mono">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-brand-forest font-medium">{user.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Sanctuary Tier</span>
                    <span className="text-brand-olive font-bold">Artisan Connoisseur</span>
                  </div>
                </div>

                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Navigation Cards */}
            <div className="space-y-2 font-medium text-xs">
              <Link
                href="/orders"
                className="flex items-center justify-between p-3.5 rounded-lg border border-brand-forest/10 bg-card hover:bg-brand-forest/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-brand-copper" />
                  <span>Order History ({MOCK_ORDERS.length})</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center justify-between p-3.5 rounded-lg border border-brand-forest/10 bg-card hover:bg-brand-forest/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4 text-brand-copper" />
                  <span>Saved Objects</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/admin"
                className="flex items-center justify-between p-3.5 rounded-lg border border-brand-forest/10 bg-card hover:bg-brand-forest/5 transition-colors font-mono"
              >
                <div className="flex items-center gap-2.5 text-brand-copper">
                  <Shield className="h-4 w-4" />
                  <span>Admin Portal</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {/* Right Main Content: Addresses & Recent Activity */}
          <div className="lg:col-span-8 space-y-8">
            {/* Recent Orders Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-forest">
                    Recent Orders
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Track the fulfillment of your artisanal selections
                  </p>
                </div>
                <Link
                  href="/orders"
                  className="font-mono text-xs text-brand-olive hover:underline inline-flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {MOCK_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-brand-forest/15 bg-card hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-brand-forest">
                          #{order.id}
                        </span>
                        <span className="text-xs text-muted-foreground">• {order.date}</span>
                        <Badge
                          variant={order.status === "Delivered" ? "default" : "secondary"}
                          className="text-[10px] font-mono"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-brand-forest/80">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-brand-forest/10">
                      <span className="font-mono text-sm font-bold text-brand-forest">
                        ${order.total.toFixed(2)}
                      </span>
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <Link href={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-forest">
                    Saved Sanctuaries
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Addresses for seamless, carbon-neutral shipping
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Address</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <Card key={addr.id} className="border-brand-forest/15 relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-brand-copper" />
                          <span>{addr.title}</span>
                        </CardTitle>
                        {addr.isDefault && (
                          <Badge variant="default" className="text-[10px] font-mono">
                            Default
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground leading-relaxed">
                      <p className="font-medium text-brand-forest">{user.name}</p>
                      <p>{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                      <p>{addr.country}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
