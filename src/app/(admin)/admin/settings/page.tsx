import { Shield, Bell, Store, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-brand-forest">
          Store Settings & Configuration
        </h2>
        <p className="text-xs text-muted-foreground">
          Manage general store metadata, shipping thresholds, and notification webhooks
        </p>
      </div>

      <div className="space-y-6">
        {/* General Store Info */}
        <Card className="border-brand-forest/15 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Store className="h-4 w-4 text-brand-olive" />
              <span>General Storefront Identity</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Brand title, public contact address, and default currency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-forest">Store Name</label>
                <Input defaultValue="Aura & Earth" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-forest">Support Email</label>
                <Input defaultValue="concierge@auraearth.store" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-forest">Default Currency</label>
                <Input defaultValue="USD ($)" disabled className="bg-brand-forest/5 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-brand-forest">Free Shipping Minimum ($)</label>
                <Input defaultValue="100.00" className="font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card className="border-brand-forest/15 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-copper" />
              <span>Security & Privileged Operations</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Database Row-Level Security, backup intervals, and service roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-lg border border-brand-forest/10 bg-brand-forest/5">
              <div>
                <p className="font-semibold text-brand-forest">Supabase Row-Level Security (RLS)</p>
                <p className="text-[11px] text-muted-foreground font-sans">
                  Active policy enforcing tenant isolation on tables
                </p>
              </div>
              <span className="text-brand-olive font-bold">ENFORCED</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-brand-forest/10 bg-brand-forest/5">
              <div>
                <p className="font-semibold text-brand-forest">Per-User Gemini Key Isolation</p>
                <p className="text-[11px] text-muted-foreground font-sans">
                  Keys are stored in user metadata, zero server environment exposure
                </p>
              </div>
              <span className="text-brand-olive font-bold">ACTIVE</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm">
            Discard Changes
          </Button>
          <Button variant="default" size="sm">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
