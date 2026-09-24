"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  AlertCircle,
  Save,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { authService, type Profile } from "@/services/auth.service";
import type { Database } from "@/types/database.types";

type Address = Database["public"]["Tables"]["addresses"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

export default function AccountPage() {
  const searchParams = useSearchParams();
  const unauthorizedAdminError = searchParams.get("error") === "unauthorized_admin";

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Profile Edit State
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [newAddrFullName, setNewAddrFullName] = React.useState("");
  const [newAddrLine1, setNewAddrLine1] = React.useState("");
  const [newAddrCity, setNewAddrCity] = React.useState("");
  const [newAddrState, setNewAddrState] = React.useState("");
  const [newAddrPostal, setNewAddrPostal] = React.useState("");
  const [isAddingAddr, setIsAddingAddr] = React.useState(false);

  const loadUserData = React.useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch profile
    const { data: prof } = (await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()) as { data: Profile | null; error: unknown };

    if (prof) {
      setProfile(prof);
      setEditName(prof.full_name || "");
      setEditPhone(prof.phone || "");
    }

    // Fetch user's saved addresses (enforced by RLS)
    const { data: addrs } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (addrs) setAddresses(addrs);

    // Fetch user's orders (enforced by RLS)
    const { data: ords } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (ords) setOrders(ords);

    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSaveStatus(null);

    const res = await authService.updateProfile({
      full_name: editName,
      phone: editPhone,
    });

    if (res.success && res.data) {
      setProfile(res.data);
      setSaveStatus("Profile updated successfully");
      setIsEditing(false);
    } else {
      setSaveStatus(res.error?.message || "Failed to update profile");
    }
    setIsSaving(false);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsAddingAddr(true);

    const supabase = createClient();
    const { data, error } = (await (supabase
      .from("addresses") as any)
      .insert({
        user_id: profile.id,
        full_name: newAddrFullName || profile.full_name || "Resident",
        line1: newAddrLine1,
        city: newAddrCity,
        state: newAddrState,
        postal_code: newAddrPostal,
        country: "US",
        address_type: "shipping",
        is_default: addresses.length === 0,
      })
      .select()
      .single()) as { data: Address | null; error: unknown };

    if (!error && data) {
      setAddresses((prev) => [data, ...prev]);
      setIsAddressModalOpen(false);
      setNewAddrLine1("");
      setNewAddrCity("");
      setNewAddrState("");
      setNewAddrPostal("");
    }
    setIsAddingAddr(false);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    window.location.href = "/";
  };

  const memberSince = profile
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

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
        {/* Admin unauthorized warning notice if redirected */}
        {unauthorizedAdminError && (
          <div className="mb-8 rounded-lg bg-amber-500/10 border border-amber-500/30 p-4 text-xs font-mono text-amber-900 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Administrative Access Restricted</p>
              <p className="text-amber-800 mt-0.5">
                The requested page requires administrative credentials. You are currently authenticated as a{" "}
                <strong className="underline">{profile?.role || "customer"}</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-brand-forest/15 shadow-sm">
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-brand-olive/30 shadow-md bg-brand-cornsilk">
                  <Image
                    src={
                      profile?.avatar_url ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                    }
                    alt={profile?.full_name || "Member Avatar"}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-brand-forest">
                    {profile?.full_name || "Aura Member"}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground">{profile?.email}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      Member since {memberSince}
                    </Badge>
                    {profile?.role === "admin" ? (
                      <Badge variant="default" className="text-[10px] font-mono bg-brand-clay text-brand-forest font-bold">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-mono text-brand-olive border-brand-olive/30">
                        Customer
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Edit Profile Form Toggle */}
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-3 border-t border-brand-forest/10 text-left text-xs">
                    <div>
                      <label className="font-medium text-brand-forest">Full Name</label>
                      <Input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 h-8 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-medium text-brand-forest">Phone Number</label>
                      <Input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" size="sm" isLoading={isSaving} className="flex-1 text-xs gap-1">
                        <Save className="h-3.5 w-3.5" />
                        <span>Save</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="pt-4 border-t border-brand-forest/10 space-y-2 text-left text-xs font-mono">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-brand-forest font-medium">{profile?.phone || "Not configured"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Sanctuary Role</span>
                      <span className="text-brand-olive font-bold uppercase">{profile?.role || "customer"}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="w-full text-xs text-brand-olive hover:bg-brand-olive/10 mt-1"
                    >
                      Edit Profile Info
                    </Button>
                  </div>
                )}

                {saveStatus && (
                  <p className="text-[11px] font-mono text-brand-olive">{saveStatus}</p>
                )}

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
                  <span>Order History ({orders.length})</span>
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

              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-brand-forest/10 bg-card hover:bg-brand-forest/5 transition-colors font-mono"
                >
                  <div className="flex items-center gap-2.5 text-brand-copper font-bold">
                    <Shield className="h-4 w-4" />
                    <span>Admin Portal</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Main Content: Addresses & Orders */}
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

              {orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-forest/20 p-8 text-center bg-card/50">
                  <Package className="h-8 w-8 text-brand-forest/40 mx-auto mb-2" />
                  <p className="font-display font-medium text-brand-forest">No orders placed yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Your confirmed orders will appear here for easy tracking.</p>
                  <Link href="/products">
                    <Button variant="outline" size="sm" className="mt-4 text-xs">
                      Explore Catalog
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-brand-forest/15 bg-card hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-brand-forest">
                            #{order.order_number}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <Badge
                            variant={order.status === "delivered" ? "default" : "secondary"}
                            className="text-[10px] font-mono capitalize"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-brand-forest/80 font-mono">
                          Payment: <span className="capitalize">{order.payment_status}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-brand-forest/10">
                        <span className="font-mono text-sm font-bold text-brand-forest">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                        <Button variant="outline" size="sm" asChild className="text-xs">
                          <Link href={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <Button
                  onClick={() => setIsAddressModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Address</span>
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-forest/20 p-6 text-center bg-card/50">
                  <MapPin className="h-6 w-6 text-brand-forest/40 mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground">No saved addresses on file.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <Card key={addr.id} className="border-brand-forest/15 relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-brand-copper" />
                            <span>{addr.address_type === "shipping" ? "Delivery Address" : "Billing Address"}</span>
                          </CardTitle>
                          {addr.is_default && (
                            <Badge variant="default" className="text-[10px] font-mono">
                              Default
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground leading-relaxed">
                        <p className="font-medium text-brand-forest">{addr.full_name}</p>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                        <p>{addr.country}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Add Address Modal Dialog */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Delivery Address</DialogTitle>
            <DialogDescription>
              Save an address to your profile for faster checkout.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddAddress} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium text-brand-forest">Recipient Full Name</label>
              <Input
                type="text"
                placeholder={profile?.full_name || "Eleanor Vance"}
                value={newAddrFullName}
                onChange={(e) => setNewAddrFullName(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-medium text-brand-forest">Street Address</label>
              <Input
                type="text"
                placeholder="124 Sanctuary Way"
                value={newAddrLine1}
                onChange={(e) => setNewAddrLine1(e.target.value)}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-brand-forest">City</label>
                <Input
                  type="text"
                  placeholder="Portland"
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                  className="mt-1 h-9 text-xs"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-brand-forest">State / Province</label>
                <Input
                  type="text"
                  placeholder="OR"
                  value={newAddrState}
                  onChange={(e) => setNewAddrState(e.target.value)}
                  className="mt-1 h-9 text-xs"
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-medium text-brand-forest">Postal Code</label>
              <Input
                type="text"
                placeholder="97201"
                value={newAddrPostal}
                onChange={(e) => setNewAddrPostal(e.target.value)}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isAddingAddr}>
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
