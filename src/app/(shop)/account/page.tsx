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
  Edit2,
  Trash2,
  Star,
  RefreshCw,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { authService, type Profile } from "@/services/auth.service";
import { addressService, type AddressRow } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatters";
import type { Order } from "@/types/order.types";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const unauthorizedAdminError = searchParams.get("error") === "unauthorized_admin";

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [addresses, setAddresses] = React.useState<AddressRow[]>([]);
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
  const [editingAddrId, setEditingAddrId] = React.useState<string | null>(null);
  const [addrFullName, setAddrFullName] = React.useState("");
  const [addrPhone, setAddrPhone] = React.useState("");
  const [addrLine1, setAddrLine1] = React.useState("");
  const [addrLine2, setAddrLine2] = React.useState("");
  const [addrCity, setAddrCity] = React.useState("");
  const [addrState, setAddrState] = React.useState("");
  const [addrPostal, setAddrPostal] = React.useState("");
  const [addrCountry, setAddrCountry] = React.useState("US");
  const [isDefaultAddr, setIsDefaultAddr] = React.useState(false);
  const [isSavingAddr, setIsSavingAddr] = React.useState(false);

  const loadUserData = React.useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    // Fetch user's saved addresses
    const addrs = await addressService.getAddresses();
    setAddresses(addrs);

    // Fetch user's orders
    const ords = await orderService.getOrders();
    setOrders(ords);

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

  const handleOpenAddAddress = () => {
    setEditingAddrId(null);
    setAddrFullName(profile?.full_name || "");
    setAddrPhone(profile?.phone || "");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
    setAddrPostal("");
    setAddrCountry("US");
    setIsDefaultAddr(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: AddressRow) => {
    setEditingAddrId(addr.id);
    setAddrFullName(addr.full_name);
    setAddrPhone(addr.phone || "");
    setAddrLine1(addr.line1);
    setAddrLine2(addr.line2 || "");
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPostal(addr.postal_code);
    setAddrCountry(addr.country);
    setIsDefaultAddr(addr.is_default);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddr(true);

    try {
      if (editingAddrId) {
        const updated = await addressService.updateAddress(editingAddrId, {
          full_name: addrFullName,
          phone: addrPhone || null,
          line1: addrLine1,
          line2: addrLine2 || null,
          city: addrCity,
          state: addrState,
          postal_code: addrPostal,
          country: addrCountry,
          is_default: isDefaultAddr,
        });
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editingAddrId
              ? updated
              : isDefaultAddr
              ? { ...a, is_default: false }
              : a
          )
        );
      } else {
        const created = await addressService.createAddress({
          full_name: addrFullName,
          phone: addrPhone || null,
          line1: addrLine1,
          line2: addrLine2 || null,
          city: addrCity,
          state: addrState,
          postal_code: addrPostal,
          country: addrCountry,
          is_default: isDefaultAddr || addresses.length === 0,
        });
        if (isDefaultAddr) {
          setAddresses((prev) => [created, ...prev.map((a) => ({ ...a, is_default: false }))]);
        } else {
          setAddresses((prev) => [created, ...prev]);
        }
      }
      setIsAddressModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Could not save address");
    } finally {
      setIsSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          is_default: a.id === id,
        }))
      );
    } catch (err: any) {
      alert(err.message || "Failed to set default address");
    }
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
          <Breadcrumbs items={[{ label: "Account Sanctuary" }]} className="mb-2" />
          <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-light">
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
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-brand-forest/15 overflow-hidden shadow-sm">
              <div className="h-20 bg-brand-forest/10" />
              <CardContent className="pt-0 -mt-10 space-y-4">
                <div className="flex items-end justify-between">
                  <div className="relative h-20 w-20 rounded-full border-4 border-card overflow-hidden bg-brand-cornsilk flex items-center justify-center text-brand-forest shadow-md">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name || "Profile"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 opacity-60" />
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] capitalize">
                    {profile?.role || "Resident"}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-brand-forest">
                    {profile?.full_name || "Mindful Resident"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">{profile?.email}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">
                    Sanctuary member since {memberSince}
                  </p>
                </div>

                {/* Profile Edit Form / Display */}
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-xs font-mono">
                    <div>
                      <label className="text-muted-foreground">Full Name</label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Phone</label>
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1 h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSaving}
                        className="text-xs bg-brand-forest text-brand-cornsilk flex-1"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
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
                  <div className="space-y-2 pt-2 text-xs font-mono border-t border-brand-forest/10">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-brand-forest">{profile?.phone || "Not provided"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="w-full text-xs font-mono mt-2 border-brand-forest/20"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}

                {saveStatus && (
                  <p className="text-[11px] font-mono text-emerald-700 text-center">{saveStatus}</p>
                )}

                <div className="pt-2 border-t border-brand-forest/10">
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-mono text-destructive hover:bg-destructive/10 justify-start gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out from Sanctuary</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Orders & Addresses */}
          <div className="lg:col-span-8 space-y-10">
            {/* Orders Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-brand-forest">Recent Orders</h2>
                  <p className="text-xs text-muted-foreground">
                    Itemized histories, tracking numbers, and delivery status
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="text-xs font-mono border-brand-forest/20">
                  <Link href="/orders">View All Orders</Link>
                </Button>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-brand-forest/20 p-8 text-center bg-card/50">
                  <Package className="h-8 w-8 text-brand-forest/40 mx-auto mb-2" />
                  <p className="font-display font-medium text-brand-forest">No orders placed yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your confirmed orders will appear here for easy tracking.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4 text-xs font-mono">
                    <Link href="/products">Explore Catalog</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-brand-forest/15 bg-card hover:shadow-sm transition-shadow font-mono text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-brand-forest text-sm">
                            #{order.orderNumber}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <Badge
                            variant={order.status === "delivered" ? "default" : "secondary"}
                            className="text-[10px] capitalize px-2 py-0"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {order.items.length} unique craft(s) · Carrier: {order.carrier || "Standard"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-brand-forest/10">
                        <span className="text-sm font-bold text-brand-forest">
                          {formatCurrency(order.totalAmount)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs border-brand-forest/20 hover:bg-brand-forest hover:text-brand-cornsilk"
                        >
                          <Link href={`/orders/${order.id}`}>Track Order</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Addresses Section (With Add, Edit, Delete, Set Default) */}
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
                  onClick={handleOpenAddAddress}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs font-mono border-brand-forest/20"
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
                          <CardTitle className="text-xs font-mono font-bold flex items-center gap-1.5 text-brand-forest">
                            <MapPin className="h-3.5 w-3.5 text-brand-copper" />
                            <span>{addr.address_type === "shipping" ? "Delivery Address" : "Billing Address"}</span>
                          </CardTitle>
                          {addr.is_default && (
                            <Badge variant="default" className="text-[10px] font-mono bg-brand-forest text-brand-cornsilk">
                              Default
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs font-mono text-muted-foreground space-y-1">
                        <p className="font-bold text-brand-forest font-sans">{addr.full_name}</p>
                        <p>{addr.line1}</p>
                        {addr.line2 && <p>{addr.line2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                        <p>{addr.country}</p>
                        {addr.phone && <p className="text-[10px] pt-1">Tel: {addr.phone}</p>}

                        {/* Actions: Edit, Delete, Set Default */}
                        <div className="pt-3 border-t border-brand-forest/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-xs text-brand-olive hover:underline flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs text-destructive hover:underline flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>

                          {!addr.is_default && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[11px] text-brand-forest hover:underline"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Add / Edit Address Modal Dialog */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-brand-forest">
              {editingAddrId ? "Edit Sanctuary Address" : "Add Delivery Address"}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Save an address to your profile for faster atelier dispatch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-3 py-2 text-xs font-mono">
            <div>
              <label className="font-medium text-brand-forest">Recipient Full Name *</label>
              <Input
                type="text"
                placeholder={profile?.full_name || "Eleanor Vance"}
                value={addrFullName}
                onChange={(e) => setAddrFullName(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="font-medium text-brand-forest">Street Address *</label>
              <Input
                type="text"
                placeholder="124 Sanctuary Way"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-brand-forest">Apt / Studio / Suite</label>
                <Input
                  type="text"
                  placeholder="Suite 4B"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <label className="font-medium text-brand-forest">City *</label>
                <Input
                  type="text"
                  placeholder="Portland"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-medium text-brand-forest">State *</label>
                <Input
                  type="text"
                  placeholder="OR"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-brand-forest">Postal Code *</label>
                <Input
                  type="text"
                  placeholder="97201"
                  value={addrPostal}
                  onChange={(e) => setAddrPostal(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-brand-forest">Country *</label>
                <Input
                  type="text"
                  value={addrCountry}
                  onChange={(e) => setAddrCountry(e.target.value)}
                  className="mt-1 h-8 text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-brand-forest">Phone (Optional)</label>
              <Input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefaultAddr}
                onChange={(e) => setIsDefaultAddr(e.target.checked)}
                className="rounded border-brand-forest/20 text-brand-forest"
              />
              <span className="text-[11px] text-muted-foreground">Make this my default shipping address</span>
            </label>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingAddr}
                className="bg-brand-forest text-brand-cornsilk text-xs"
              >
                {isSavingAddr ? "Saving..." : "Save Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
