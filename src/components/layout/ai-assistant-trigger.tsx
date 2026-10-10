"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { useUIStore } from "@/stores/use-ui-store";

export function AiAssistantTrigger() {
  const { setAiAssistantOpen } = useUIStore();

  return (
    <button
      onClick={() => setAiAssistantOpen(true)}
      aria-label="Open AI Shopping Concierge"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-brand-copper/30 bg-brand-cornsilk/95 px-4 py-2.5 text-xs font-semibold text-brand-forest shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-brand-cornsilk hover:shadow-xl active:scale-95 group"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-clay/20 text-brand-copper group-hover:rotate-12 transition-transform">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <span className="font-sans tracking-wide">Ask AI Concierge</span>
      <span className="flex h-2 w-2 rounded-full bg-brand-olive animate-pulse" />
    </button>
  );
}
