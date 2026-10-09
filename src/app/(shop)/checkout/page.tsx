"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Building,
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
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/use-cart-store";
import { addressService, type AddressRow } from "@/services/address.service";
import { orderService } from "@/services/order.service";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import type { ShippingAddress, ShippingMethodId, ShippingOption } from "@/types/order.types";

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "standard",
    name: "Atelier Ground Standard",
    price: 0, // Handled dynamically: free over $150, else $15
    estimatedDelivery: "3 – 5 Business Days",
    description: "Carbon-neutral transit packed with recyclable unbleached kraft paper.",
  },
  {
    id: "express",
    name: "CarbonNeutral Express Dispatch",
    price: 25,
    estimatedDelivery: "1 – 2 Business Days",
    description: "Priority atelier picking and expedited zero-emission flight courier.",
  },
  {
    id: "white_glove",
    name: "White Glove Sanctuary Placement",
    price: 45,
    estimatedDelivery: "3 – 4 Business Days",
    description: "Scheduled room-of-choice placement and packaging deinstallation.",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, promoCode, discountPercentage, clearCart, getSubtotal } = useCartStore();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  // Address state
  const [savedAddresses, setSavedAddresses] = React.useState<AddressRow[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | "new">("new");

  // Form input for address
  const [addressForm, setAddressForm] = React.useState<ShippingAddress>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    company: "",
  });

  // Modal for adding/editing address
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddressId, setEditingAddressId] = React.useState<string | null>(null);
  const [modalForm, setModalForm] = React.useState<ShippingAddress>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    company: "",
  });
  const [saveToAccount, setSaveToAccount] = React.useState(true);

  // Shipping selection
  const [shippingMethod, setShippingMethod] = React.useState<ShippingMethodId>("standard");

  // Payment option (V1 placeholder)
  const [paymentOption, setPaymentOption] = React.useState<"invoice" | "cod">("invoice");
  const [orderNotes, setOrderNotes] = React.useState("");

  // Load user and addresses
  React.useEffect(() => {
    async function init() {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user?.user_metadata?.full_name) {
        setAddressForm((prev) =>
          prev.fullName ? prev : { ...prev, fullName: user.user_metadata?.full_name || "" }
        );
      }

      const addrs = await addressService.getAddresses();
      setSavedAddresses(addrs);

      if (addrs.length > 0) {
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
        setSelectedAddressId(defaultAddr.id);
        setAddressForm({
          fullName: defaultAddr.full_name,
          phone: defaultAddr.phone || "",
          line1: defaultAddr.line1,
          line2: defaultAddr.line2 || "",
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postal_code,
          country: defaultAddr.country,
          company: defaultAddr.company || "",
        });
      }

      setIsLoading(false);
    }

    init();
  }, []);

  // Compute financial totals
  const subtotal = getSubtotal();
  const standardShippingPrice = subtotal >= 150 ? 0 : 15;
  const selectedShippingPrice =
    shippingMethod === "express" ? 25 : shippingMethod === "white_glove" ? 45 : standardShippingPrice;

  const discountAmount =
    discountPercentage > 0 ? Number(((subtotal * discountPercentage) / 100).toFixed(2)) : 0;

  const taxAmount = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number(
    Math.max(0, subtotal + selectedShippingPrice + taxAmount - discountAmount).toFixed(2)
  );

  // Address selection handler
  const handleSelectAddress = (addr: AddressRow) => {
    setSelectedAddressId(addr.id);
    setAddressForm({
      fullName: addr.full_name,
      phone: addr.phone || "",
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postal_code,
      country: addr.country,
      company: addr.company || "",
    });
  };

  const handleOpenNewAddressModal = () => {
    setEditingAddressId(null);
    setModalForm({
      fullName: currentUser?.user_metadata?.full_name || "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
      company: "",
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddressModal = (addr: AddressRow) => {
    setEditingAddressId(addr.id);
    setModalForm({
      fullName: addr.full_name,
      phone: addr.phone || "",
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      postalCode: addr.postal_code,
      country: addr.country,
      company: addr.company || "",
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveModalAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.fullName || !modalForm.line1 || !modalForm.city || !modalForm.state || !modalForm.postalCode) {
      toast({
        title: "Required Fields Missing",
        description: "Please complete the required address fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingAddressId) {
        const updated = await addressService.updateAddress(editingAddressId, {
          full_name: modalForm.fullName,
          phone: modalForm.phone || null,
          line1: modalForm.line1,
          line2: modalForm.line2 || null,
          city: modalForm.city,
          state: modalForm.state,
          postal_code: modalForm.postalCode,
          country: modalForm.country,
          company: modalForm.company || null,
        });
        setSavedAddresses((prev) =>
          prev.map((a) => (a.id === editingAddressId ? updated : a))
        );
        if (selectedAddressId === editingAddressId) {
          handleSelectAddress(updated);
        }
        toast({ title: "Address Updated", description: "Saved address updated successfully." });
      } else {
        const created = await addressService.createAddress({
          full_name: modalForm.fullName,
          phone: modalForm.phone || null,
          line1: modalForm.line1,
          line2: modalForm.line2 || null,
          city: modalForm.city,
          state: modalForm.state,
          postal_code: modalForm.postalCode,
          country: modalForm.country,
          company: modalForm.company || null,
          is_default: savedAddresses.length === 0,
        });
        setSavedAddresses((prev) => [created, ...prev]);
        handleSelectAddress(created);
        toast({ title: "Address Added", description: "New address added to your sanctuary." });
      }
      setIsAddressModalOpen(false);
    } catch (err: any) {
      toast({
        title: "Error saving address",
        description: err.message || "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      const remaining = savedAddresses.filter((a) => a.id !== id);
      setSavedAddresses(remaining);
      if (selectedAddressId === id) {
        if (remaining.length > 0) {
          handleSelectAddress(remaining[0]);
        } else {
          setSelectedAddressId("new");
        }
      }
      toast({ title: "Address Removed", description: "Address removed from saved list." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not delete address", variant: "destructive" });
    }
  };

  // Place Order Action
  const handlePlaceOrder = async () => {
    // 1. Validate items
    if (items.length === 0) {
      toast({
        title: "Empty Shopping Bag",
        description: "Please add products before checking out.",
        variant: "destructive",
      });
      router.push("/products");
      return;
    }

    // 2. Validate address
    if (
      !addressForm.fullName.trim() ||
      !addressForm.line1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.postalCode.trim()
    ) {
      toast({
        title: "Shipping Address Required",
        description: "Please fill out all mandatory shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save address if guest or requested
      if (selectedAddressId === "new" && saveToAccount && currentUser) {
        try {
          await addressService.createAddress({
            full_name: addressForm.fullName,
            phone: addressForm.phone || null,
            line1: addressForm.line1,
            line2: addressForm.line2 || null,
            city: addressForm.city,
            state: addressForm.state,
            postal_code: addressForm.postalCode,
            country: addressForm.country,
            company: addressForm.company || null,
            is_default: savedAddresses.length === 0,
          });
        } catch {
          // Non-blocking
        }
      }

      // 3. Create Order via OrderService
      const createdOrder = await orderService.createOrder({
        shippingAddress: addressForm,
        shippingMethod,
        shippingCost: selectedShippingPrice,
        notes: orderNotes.trim() ? `[Method: ${paymentOption}] ${orderNotes.trim()}` : `[Method: ${paymentOption}]`,
        promoCode: promoCode || undefined,
        discountAmount,
      });

      // 4. Clear client cart
      clearCart();

      toast({
        title: "Order Confirmed!",
        description: `Order #${createdOrder.orderNumber} successfully placed.`,
        variant: "success",
      });

      // Redirect to confirmation screen
      router.push(`/checkout/confirmation?orderId=${createdOrder.id}`);
    } catch (err: any) {
      console.error("Order submission error:", err);
      toast({
        title: "Order Placement Issue",
        description: err.message || "Could not complete order. Please check your inventory.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-olive border-t-transparent" />
          <p className="font-mono text-xs text-muted-foreground">Preparing checkout sanctuary...</p>
        </div>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center max-w-md mx-auto">
        <div className="rounded-2xl border border-brand-forest/15 bg-brand-cornsilk/30 p-8 text-center space-y-4">
          <Sparkles className="h-10 w-10 text-brand-olive mx-auto opacity-70" />
          <h2 className="font-editorial text-2xl text-brand-forest">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-muted-foreground">
            Explore our curated mindful objects and handcrafted textiles to begin your sanctuary collection.
          </p>
          <Button asChild className="w-full bg-brand-forest text-brand-cornsilk hover:bg-brand-olive">
            <Link href="/products">Explore Catalog</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="border-b border-brand-forest/10 bg-brand-cornsilk/40 py-6">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Shopping Bag", href: "/cart" },
              { label: "Checkout Sanctuary" },
            ]}
            className="mb-2"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="font-editorial text-3xl sm:text-4xl text-brand-forest font-light">
                Secure Checkout Sanctuary
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Step-by-step dispatch configuration and atelier reservation
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-brand-olive">
              <ShieldCheck className="h-4 w-4" />
              <span>Direct Atelier Reservation</span>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Checkout Flow Steps (Left Column) */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: SHIPPING ADDRESS */}
            <section className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-brand-forest/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-brand-forest text-brand-cornsilk flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-brand-forest">Shipping Destination</h2>
                    <p className="text-xs text-muted-foreground">Where should our artisans dispatch your objects?</p>
                  </div>
                </div>

                {currentUser && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNewAddressModal}
                    className="gap-1 text-xs font-mono h-8 border-brand-forest/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Address</span>
                  </Button>
                )}
              </div>

              {/* Saved Address Cards */}
              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-mono font-medium text-brand-forest uppercase tracking-wider">
                    Saved Addresses ({savedAddresses.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`relative rounded-lg p-3.5 border cursor-pointer transition-all text-xs font-mono ${
                            isSelected
                              ? "border-brand-forest bg-brand-forest/5 shadow-sm ring-1 ring-brand-forest"
                              : "border-brand-forest/15 hover:border-brand-forest/40 bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-bold text-brand-forest flex items-center gap-1.5">
                              {addr.full_name}
                              {addr.is_default && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                  Default
                                </Badge>
                              )}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditAddressModal(addr);
                                }}
                                className="p-1 text-muted-foreground hover:text-brand-forest rounded"
                                title="Edit"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(addr.id);
                                }}
                                className="p-1 text-muted-foreground hover:text-rose-600 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-muted-foreground line-clamp-1">{addr.line1}</p>
                          {addr.line2 && <p className="text-muted-foreground line-clamp-1">{addr.line2}</p>}
                          <p className="text-muted-foreground">
                            {addr.city}, {addr.state} {addr.postal_code}
                          </p>
                          {addr.phone && <p className="text-[10px] text-muted-foreground mt-1">Tel: {addr.phone}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address Form (if "new" address or guest) */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">
                      Full Recipient Name *
                    </label>
                    <Input
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">
                      Contact Phone *
                    </label>
                    <Input
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-medium text-brand-forest">
                    Street Address *
                  </label>
                  <Input
                    required
                    value={addressForm.line1}
                    onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                    placeholder="123 Botanical Sanctuary Way"
                    className="text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">
                      Apartment, Studio, Suite
                    </label>
                    <Input
                      value={addressForm.line2 || ""}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                      placeholder="Apt 4B (Optional)"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">
                      City *
                    </label>
                    <Input
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Portland"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">State *</label>
                    <Input
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="OR"
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">Postal Code *</label>
                    <Input
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      placeholder="97201"
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-medium text-brand-forest">Country *</label>
                    <Input
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      placeholder="US"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                {currentUser && selectedAddressId === "new" && (
                  <label className="flex items-center gap-2 pt-1 text-xs font-mono text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="rounded border-brand-forest/20 text-brand-forest"
                    />
                    <span>Save this address to my sanctuary account for future dispatches</span>
                  </label>
                )}
              </div>
            </section>

            {/* STEP 2: SHIPPING SPEED */}
            <section className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-brand-forest/10 pb-4">
                <div className="h-7 w-7 rounded-full bg-brand-forest text-brand-cornsilk flex items-center justify-center font-mono text-xs font-bold">
                  2
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-forest">Shipping & Fulfillment Method</h2>
                  <p className="text-xs text-muted-foreground">Select delivery tier and packaging care</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {SHIPPING_OPTIONS.map((opt) => {
                  const isSelected = shippingMethod === opt.id;
                  const priceToDisplay =
                    opt.id === "standard" ? (standardShippingPrice === 0 ? "FREE" : "$15.00") : formatCurrency(opt.price);

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setShippingMethod(opt.id)}
                      className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-forest bg-brand-forest/5 shadow-sm ring-1 ring-brand-forest"
                          : "border-brand-forest/15 hover:border-brand-forest/40 bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-brand-forest bg-brand-forest" : "border-brand-forest/30"
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-brand-cornsilk" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-brand-forest">{opt.name}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {opt.estimatedDelivery}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm font-bold text-brand-forest ml-4">
                        {priceToDisplay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP 3: PAYMENT ARCHITECTURE (V1 DIRECT ATELIER CONFIRMATION) */}
            <section className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-brand-forest/10 pb-4">
                <div className="h-7 w-7 rounded-full bg-brand-forest text-brand-cornsilk flex items-center justify-center font-mono text-xs font-bold">
                  3
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-forest">Payment Architecture</h2>
                  <p className="text-xs text-muted-foreground">V1 Direct Reservation — Payment gateway ready for V2</p>
                </div>
              </div>

              {/* Informative V1 Banner */}
              <div className="rounded-lg bg-brand-olive/10 border border-brand-olive/20 p-4 flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-brand-olive flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-brand-forest">V1 Direct Atelier Reservation</p>
                  <p className="text-muted-foreground">
                    Payment gateways (Stripe, Razorpay) will be integrated in future phases. No immediate charge will be
                    processed today. Placing this order secures stock reservation in the master database.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => setPaymentOption("invoice")}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all text-xs font-mono ${
                    paymentOption === "invoice"
                      ? "border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest font-semibold"
                      : "border-brand-forest/15 hover:border-brand-forest/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-brand-forest">Direct Atelier Invoice</span>
                    {paymentOption === "invoice" && <CheckCircle2 className="h-4 w-4 text-brand-olive" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-normal">
                    Itemized receipt sent to your account email with net reservation.
                  </p>
                </div>

                <div
                  onClick={() => setPaymentOption("cod")}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all text-xs font-mono ${
                    paymentOption === "cod"
                      ? "border-brand-forest bg-brand-forest/5 ring-1 ring-brand-forest font-semibold"
                      : "border-brand-forest/15 hover:border-brand-forest/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-brand-forest">Pay Upon Delivery / Handover</span>
                    {paymentOption === "cod" && <CheckCircle2 className="h-4 w-4 text-brand-olive" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-normal">
                    Settle balance upon hand-delivery and sanctuary inspection.
                  </p>
                </div>
              </div>

              {/* Special Delivery Instructions / Notes */}
              <div className="pt-2 space-y-1">
                <label className="text-xs font-mono font-medium text-brand-forest">
                  Sanctuary Notes & Delivery Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Gate code, doorstep drop preference, or gift note for recipient..."
                  className="w-full rounded-md border border-brand-forest/20 bg-background px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-forest"
                />
              </div>
            </section>
          </div>

          {/* Sticky Order Summary Sidebar (Right Column) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="rounded-xl border border-brand-forest/15 bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-brand-forest/10 pb-4">
                <h3 className="font-display text-lg font-bold text-brand-forest">Order Summary</h3>
                <span className="text-xs font-mono text-muted-foreground">{items.length} unique craft(s)</span>
              </div>

              {/* Items Preview */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-brand-cornsilk/30 flex-shrink-0 border border-brand-forest/10">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-forest truncate">{item.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Qty: {item.quantity} · {[item.color, item.size].filter(Boolean).join(" / ") || "Standard"}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-brand-forest">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation */}
              <div className="border-t border-brand-forest/10 pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-muted-foreground">
                  <span>Craft Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping ({shippingMethod})</span>
                  <span>
                    {selectedShippingPrice === 0 ? "FREE" : formatCurrency(selectedShippingPrice)}
                  </span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({promoCode})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-brand-forest/10 pt-3 flex justify-between text-base font-bold text-brand-forest">
                  <span>Total Investment</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <div className="pt-2 space-y-3">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-brand-forest text-brand-cornsilk hover:bg-brand-olive shadow-md py-6 text-sm font-bold tracking-wide"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cornsilk border-t-transparent" />
                      <span>Securing Atelier Reservation...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Sanctuary Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-center font-mono text-muted-foreground">
                  By clicking Place Order, your pieces are instantly reserved in PostgreSQL and queued for atelier dispatch.
                </p>
              </div>

              {/* Security Badges */}
              <div className="border-t border-brand-forest/10 pt-4 space-y-2 text-[11px] font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-olive" />
                  <span>Server-validated pricing and inventory bounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-brand-olive" />
                  <span>Complimentary carbon offsets on every delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Address Edit/Add Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-brand-forest">
              {editingAddressId ? "Edit Destination Address" : "Add Sanctuary Address"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure dispatch details for effortless delivery.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModalAddress} className="space-y-3 py-2 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-muted-foreground">Full Name *</label>
              <Input
                required
                value={modalForm.fullName}
                onChange={(e) => setModalForm({ ...modalForm, fullName: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground">Street Address *</label>
              <Input
                required
                value={modalForm.line1}
                onChange={(e) => setModalForm({ ...modalForm, line1: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-muted-foreground">Suite / Apt</label>
                <Input
                  value={modalForm.line2 || ""}
                  onChange={(e) => setModalForm({ ...modalForm, line2: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">City *</label>
                <Input
                  required
                  value={modalForm.city}
                  onChange={(e) => setModalForm({ ...modalForm, city: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-muted-foreground">State *</label>
                <Input
                  required
                  value={modalForm.state}
                  onChange={(e) => setModalForm({ ...modalForm, state: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Zip Code *</label>
                <Input
                  required
                  value={modalForm.postalCode}
                  onChange={(e) => setModalForm({ ...modalForm, postalCode: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground">Country</label>
                <Input
                  required
                  value={modalForm.country}
                  onChange={(e) => setModalForm({ ...modalForm, country: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground">Phone Number</label>
              <Input
                value={modalForm.phone || ""}
                onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                placeholder="+1..."
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-brand-forest text-brand-cornsilk text-xs">
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
