"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ArrowLeft, Mail } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <Card className="border-brand-forest/15 shadow-md">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter the email associated with your sanctuary account to receive a reset link.
        </CardDescription>
      </CardHeader>

      {isSuccess ? (
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-brand-olive/15 border border-brand-olive/30 p-4 text-xs font-mono text-brand-forest space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-brand-olive flex-shrink-0" />
              <span className="font-semibold">Reset instructions dispatched</span>
            </div>
            <p className="text-muted-foreground">
              If an account matches <strong>{email}</strong>, a recovery email has been sent. Follow the instructions to regain access.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full gap-2 mt-4 text-xs">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Button>
          </Link>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-forest">
                Registered Email Address
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="eleanor.vance@mindfulliving.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full gap-2"
              isLoading={isSubmitting}
              variant="default"
            >
              <span>Send Recovery Link</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Remember your password?{" "}
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
