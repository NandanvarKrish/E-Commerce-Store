"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
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

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    const response = await authService.signUp(email, password, fullName);

    if (!response.success) {
      setErrorMsg(response.error?.message || "Failed to create account.");
      setIsLoading(false);
      return;
    }

    // If session is immediately returned (e.g. autoconfirm enabled)
    if (response.data?.session) {
      router.push("/account");
      router.refresh();
    } else {
      setSuccessMsg(
        "Registration submitted! If email verification is enabled on your project, please check your inbox to confirm your account."
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-brand-forest/15 shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>
          Join Aura & Earth to configure your personal Gemini AI and manage orders
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

          {successMsg && (
            <div className="flex items-center gap-2 rounded-md bg-brand-olive/15 p-3 text-xs text-brand-forest">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand-olive" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-forest">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Eleanor Vance"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-forest">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-forest">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-forest">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-brand-olive hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
