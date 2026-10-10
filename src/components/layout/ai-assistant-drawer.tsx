"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Send,
  X,
  Key,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { Drawer, DrawerHeader, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/use-ui-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useToast } from "@/hooks/use-toast";
import { getStoredGeminiKey, setStoredGeminiKey } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/client";
import { formatCurrency } from "@/utils/formatters";
import type { Product } from "@/types/catalog.types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Find handcrafted ceramics under $100",
  "Suggest a calming ritual for better sleep",
  "Compare linen duvet vs matcha bowl",
  "Bestsellers for mindful housewarming",
];

const INITIAL_MESSAGE: Message = {
  id: "init-1",
  role: "assistant",
  content:
    "Welcome to Aura & Earth. I am your personal AI shopping concierge, grounded in our authentic artisan catalog. How may I help curate your sanctuary today? Ask me for budget-friendly recommendations, mindful pairings, or product comparisons.",
  timestamp: "Just now",
};

export function AiAssistantDrawer() {
  const { isAiAssistantOpen, setAiAssistantOpen } = useUIStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const [messages, setMessages] = React.useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [hasKey, setHasKey] = React.useState(false);
  const [showKeyInput, setShowKeyInput] = React.useState(false);
  const [keySaveSuccess, setKeySaveSuccess] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load configured key
  React.useEffect(() => {
    async function loadKey() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let activeKey = "";
        if (user) {
          activeKey =
            (user.user_metadata?.gemini_api_key as string) ||
            getStoredGeminiKey(user.id) ||
            "";
        } else {
          activeKey = getStoredGeminiKey() || "";
        }

        if (activeKey) {
          setApiKey(activeKey);
          setHasKey(true);
        } else {
          setHasKey(false);
        }
      } catch {
        const local = getStoredGeminiKey();
        if (local) {
          setApiKey(local);
          setHasKey(true);
        }
      }
    }

    if (isAiAssistantOpen) {
      loadKey();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isAiAssistantOpen]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (isAiAssistantOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isAiAssistantOpen]);

  const handleSaveInlineKey = () => {
    if (!apiKey.trim()) return;
    setStoredGeminiKey(apiKey.trim());
    setHasKey(true);
    setShowKeyInput(false);
    setKeySaveSuccess(true);
    setTimeout(() => setKeySaveSuccess(false), 3000);
    toast({
      title: "API Key Configured",
      description: "Your personal Gemini key is ready for AI recommendations.",
      variant: "success",
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        content: m.content,
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresKey) {
          setShowKeyInput(true);
        }
        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            data.error ||
            "I could not connect to Google Gemini. Please check your API key.",
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        recommendedProducts: data.recommendedProducts || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "A temporary network issue prevented retrieving your recommendations. Please try again.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    const res = await addItem(product, 1);
    if (res.success) {
      toast({
        title: "Added to Bag",
        description: `${product.name} has been added to your shopping bag.`,
        variant: "cart",
      });
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <Drawer
      open={isAiAssistantOpen}
      onOpenChange={setAiAssistantOpen}
      position="right"
      className="max-w-md w-full sm:max-w-lg bg-card flex flex-col h-full"
    >
      <DrawerHeader onClose={() => setAiAssistantOpen(false)}>
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-clay/20 text-brand-copper">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-bold text-brand-forest">
                  Sanctuary Concierge
                </h2>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                  Gemini AI
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Grounded in Aura & Earth artisan catalog
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="text-[11px] font-mono text-muted-foreground hover:text-brand-forest flex items-center gap-1 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </DrawerHeader>

      <DrawerContent className="p-0 flex-1 flex flex-col overflow-hidden">
        {/* Inline Key Configuration Banner if needed */}
        {(!hasKey || showKeyInput) && (
          <div className="bg-brand-cornsilk/80 border-b border-brand-clay/30 p-3.5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-brand-forest flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-brand-copper" />
                Configure Personal Gemini Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-brand-olive hover:underline inline-flex items-center gap-0.5 font-mono"
              >
                <span>Get Free Key</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-8 text-xs font-mono bg-white/80"
              />
              <Button
                size="sm"
                className="h-8 text-xs px-3 whitespace-nowrap"
                onClick={handleSaveInlineKey}
              >
                Save
              </Button>
            </div>
            {keySaveSuccess && (
              <p className="text-[11px] text-brand-olive font-mono mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" /> Key saved successfully.
              </p>
            )}
          </div>
        )}

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-muted-foreground">
                {msg.role === "user" ? (
                  <>
                    <span>You</span>
                    <User className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-brand-copper" />
                    <span>Concierge</span>
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-brand-forest text-brand-cornsilk rounded-tr-none font-sans"
                    : "bg-brand-cornsilk/60 text-brand-forest border border-brand-forest/10 rounded-tl-none font-sans"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>

              {/* Recommended Product Cards within Assistant Response */}
              {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                <div className="mt-3 w-full space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-brand-copper">
                    <Sparkles className="h-3 w-3" />
                    <span>Recommended Pieces ({msg.recommendedProducts.length})</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {msg.recommendedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-brand-forest/15 bg-white/90 hover:border-brand-forest/30 transition-all shadow-sm"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-forest/5">
                          <Image
                            src={product.images[0] || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {product.badge && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] py-0 px-1 font-mono"
                              >
                                {product.badge}
                              </Badge>
                            )}
                            <span className="text-[10px] font-mono text-muted-foreground truncate">
                              {product.category}
                            </span>
                          </div>

                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => setAiAssistantOpen(false)}
                            className="font-display text-xs font-semibold text-brand-forest hover:text-brand-olive line-clamp-1 block"
                          >
                            {product.name}
                          </Link>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs font-bold text-brand-forest">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="font-mono text-[10px] text-muted-foreground line-through">
                                {formatCurrency(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-[11px] gap-1"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                          >
                            <ShoppingBag className="h-3 w-3" />
                            <span>Add</span>
                          </Button>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => setAiAssistantOpen(false)}
                            className="text-[10px] font-mono text-center text-brand-olive hover:underline"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Loading indicator */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-muted-foreground">
                <Bot className="h-3 w-3 text-brand-copper" />
                <span>Concierge is searching the catalog...</span>
              </div>
              <div className="rounded-2xl rounded-tl-none bg-brand-cornsilk/60 border border-brand-forest/10 p-3 text-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-copper animate-ping" />
                <span className="font-mono text-muted-foreground text-[11px]">
                  Curating mindful recommendations...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-brand-forest/10 bg-brand-cornsilk/30">
            <p className="text-[10px] font-mono text-muted-foreground mb-1.5">
              Suggested queries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-brand-forest/15 bg-white/90 px-2.5 py-1 text-[11px] text-brand-forest hover:bg-brand-forest hover:text-brand-cornsilk transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-brand-forest/15 bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about gifts, materials, styling, or budget..."
                className="h-10 text-xs pr-8 bg-brand-forest/5 border-brand-forest/20 focus-visible:ring-brand-olive"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="h-10 px-3.5 gap-1.5 flex-shrink-0"
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Send</span>
            </Button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-olive" />
              100% Grounded in verified catalog
            </span>
            {!hasKey && (
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-brand-copper hover:underline font-mono"
              >
                Set Personal API Key
              </button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
