"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Shield,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import {
  saveGeminiKeyToSupabase,
  setStoredGeminiKey,
  removeStoredGeminiKey,
  getStoredGeminiKey,
} from "@/lib/gemini";

export function GeminiKeyCard() {
  const [supabase] = useState(() => createClient());
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Load user session and user-specific key
  const loadUserAndKey = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setCurrentUser({ id: user.id, email: user.email });
      const remoteKey = (user.user_metadata?.gemini_api_key as string) || null;
      const localKey = getStoredGeminiKey(user.id);
      const activeKey = remoteKey || localKey || "";

      setApiKey(activeKey);
      setIsSaved(Boolean(activeKey));
    } else {
      setCurrentUser(null);
      const guestKey = getStoredGeminiKey();
      if (guestKey) {
        setApiKey(guestKey);
        setIsSaved(true);
      } else {
        setApiKey("");
        setIsSaved(false);
      }
    }
  }, [supabase]);

  useEffect(() => {
    loadUserAndKey();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUserAndKey();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadUserAndKey]);

  // Handle saving key to user's profile and localStorage
  const handleSave = async () => {
    if (!apiKey.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid Gemini API key before saving.",
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    if (currentUser) {
      const res = await saveGeminiKeyToSupabase(apiKey);
      setIsSaving(false);

      if (res.success) {
        setIsSaved(true);
        setStatusMessage({
          type: "success",
          text: `Gemini API key saved to your personal account profile (${currentUser.email}).`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to save key to profile.",
        });
      }
    } else {
      // Guest mode
      setStoredGeminiKey(apiKey);
      setIsSaved(true);
      setIsSaving(false);
      setStatusMessage({
        type: "info",
        text: "Saved to browser storage. Sign in to permanently sync this key to your account.",
      });
    }
  };

  // Remove key
  const handleRemove = async () => {
    if (currentUser) {
      await supabase.auth.updateUser({
        data: { gemini_api_key: null },
      });
      removeStoredGeminiKey(currentUser.id);
    } else {
      removeStoredGeminiKey();
    }

    setApiKey("");
    setIsSaved(false);
    setStatusMessage({
      type: "info",
      text: "Your Gemini API key has been cleared.",
    });
  };

  // Verify key against Google Gemini API
  const handleVerify = async () => {
    if (!apiKey.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please enter a key to verify.",
      });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/gemini/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        if (currentUser) {
          await saveGeminiKeyToSupabase(apiKey);
        } else {
          setStoredGeminiKey(apiKey);
        }
        setIsSaved(true);
        setStatusMessage({
          type: "success",
          text: "Verification successful! Key is active and operational for your account.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Verification failed. Check your API key.",
        });
      }
    } catch (_err) {
      setStatusMessage({
        type: "error",
        text: "Network error while validating key.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Sign out user
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setApiKey("");
    setIsSaved(false);
    setStatusMessage({
      type: "info",
      text: "Signed out successfully.",
    });
  };

  return (
    <Card className="border-brand-clay/40 bg-card/95 shadow-md relative overflow-hidden">
      <div className="absolute top-0 right-0 h-32 w-32 bg-brand-clay/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-clay/20 text-brand-copper">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-display text-brand-forest">
                Personal Gemini API Key
              </CardTitle>
              <CardDescription className="text-xs">
                Each user configures their own key for personalized AI shopping recommendations
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <Badge variant="default" className="gap-1 font-mono text-xs">
                <User className="h-3 w-3" />
                <span>{currentUser.email}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                Guest Mode
              </Badge>
            )}

            <Badge
              variant={isSaved ? "default" : "secondary"}
              className="font-mono text-xs"
            >
              {isSaved ? "Key Configured" : "No Key Set"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* If user is not logged in, show login prompt option */}
        {!currentUser && (
          <div className="rounded-lg border border-brand-clay/30 bg-brand-cornsilk/60 p-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold text-brand-forest flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-brand-copper" />
                  Sign in to link this key to your account
                </p>
                <p className="text-muted-foreground">
                  Signing in automatically saves your Gemini API key to your private Supabase profile across all your devices.
                </p>
              </div>
              <Link href="/login">
                <Button size="sm" variant="secondary" className="gap-1.5 whitespace-nowrap">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-brand-forest flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-brand-copper" />
              <span>
                {currentUser ? `API Key for ${currentUser.email}` : "Your Personal Gemini API Key"}
              </span>
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-olive hover:underline inline-flex items-center gap-1 font-mono"
            >
              <span>Get API key from Google AI Studio</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (statusMessage) setStatusMessage(null);
                }}
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-forest transition-colors"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="button"
              variant="default"
              onClick={handleSave}
              isLoading={isSaving}
              className="gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{currentUser ? "Save to Profile" : "Save Key"}</span>
            </Button>
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`flex items-start gap-2.5 rounded-md p-3 text-xs font-mono transition-all ${
              statusMessage.type === "success"
                ? "bg-brand-olive/10 text-brand-forest border border-brand-olive/20"
                : statusMessage.type === "error"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand-olive mt-0.5" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive mt-0.5" />
            ) : (
              <Shield className="h-4 w-4 flex-shrink-0 text-brand-copper mt-0.5" />
            )}
            <p className="flex-1">{statusMessage.text}</p>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-olive" />
            Zero hardcoded keys. Each customer manages their own key securely.
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleVerify}
              isLoading={isVerifying}
              className="h-8 text-xs font-mono"
            >
              Test & Verify
            </Button>

            {isSaved && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </Button>
            )}

            {currentUser && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 text-xs text-muted-foreground hover:text-brand-forest gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
