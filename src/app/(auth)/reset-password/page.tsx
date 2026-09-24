"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    const response = await authService.updatePassword(password);

    if (!response.success) {
      setErrorMsg(response.error?.message || "Failed to update password.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      router.push("/account");
    }, 2000);
  };

  return (
    <Card className="border-brand-forest/15 shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
        <CardDescription>
          Enter your new sanctuary password below to regain full account access.
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-brand-olive/15 border border-brand-olive/30 p-4 text-xs font-mono text-brand-forest space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-olive flex-shrink-0" />
              <span className="font-semibold">Password updated successfully</span>
            </div>
            <p className="text-muted-foreground">
              Your password has been changed. Redirecting you to your account sanctuary...
            </p>
          </div>
        </CardContent>
      ) : (
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
                New Password
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
                Confirm New Password
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
              isLoading={isSubmitting}
              variant="default"
            >
              <span>Update Password</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Return to{" "}
              <Link
                href="/login"
                className="font-medium text-brand-olive hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
