"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const response = await authService.signInWithPassword(email, password);

    if (!response.success || !response.data) {
      setErrorMsg(response.error?.message || "Invalid email or password.");
      setIsLoading(false);
      return;
    }

    // Role-aware redirect or respect requested redirect target
    const userRole = response.data.app_metadata?.role;
    let destination = redirectTo && redirectTo.startsWith("/") ? redirectTo : "/account";

    // If logging into admin account and no specific redirect, send directly to /admin
    if (userRole === "admin" && (!redirectTo || redirectTo === "/account")) {
      destination = "/admin";
    }

    router.push(destination);
    router.refresh();
  };

  const fillCustomerCredentials = () => {
    setEmail("customer@auraearth.com");
    setPassword("Password123!");
    setErrorMsg(null);
  };

  const fillAdminCredentials = () => {
    setEmail("admin@auraearth.com");
    setPassword("AdminPassword123!");
    setErrorMsg(null);
  };

  return (
    <Card className="border-brand-forest/15 shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={fillCustomerCredentials}
              className="inline-flex items-center gap-1 rounded bg-brand-clay/20 px-2 py-1 font-mono text-[10px] font-medium text-brand-forest hover:bg-brand-clay/30 transition-colors"
            >
              <Sparkles className="h-3 w-3 text-brand-copper" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="inline-flex items-center gap-1 rounded bg-brand-olive/20 px-2 py-1 font-mono text-[10px] font-medium text-brand-forest hover:bg-brand-olive/30 transition-colors"
            >
              <ShieldCheck className="h-3 w-3 text-brand-olive" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
        <CardDescription>
          Enter your credentials to access your sanctuary account and orders
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-forest">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="customer@auraearth.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-brand-forest">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-olive hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2"
            isLoading={isLoading}
            variant="default"
          >
            <span>Continue to Sanctuary</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="font-medium text-brand-olive hover:underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
