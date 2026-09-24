"use client";

import * as React from "react";
import Image from "next/image";
import { Box, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasContainerProps {
  fallbackImage?: string;
  fallbackAlt?: string;
  modelUrl?: string;
  className?: string;
  aspectRatio?: string;
  title?: string;
}

/**
 * CanvasContainer
 * Architectural wrapper preparing the interface for future Three.js/WebGL interactive viewports.
 * In this foundation stage, it displays the high-res product visual with 3D ready badge,
 * and handles progressive loading for future canvas mounting.
 */
export function CanvasContainer({
  fallbackImage,
  fallbackAlt = "Product visual",
  className,
  aspectRatio = "aspect-square",
  title,
}: CanvasContainerProps) {
  const [is3DReady] = React.useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-brand-forest/10 bg-brand-cornsilk/50 transition-all",
        aspectRatio,
        className
      )}
    >
      {/* 3D Readiness Badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-brand-forest/80 px-2.5 py-1 text-[10px] font-mono font-medium text-brand-cornsilk backdrop-blur-md shadow-sm">
        <Box className="h-3 w-3 text-brand-clay" />
        <span>3D Ready</span>
      </div>

      {is3DReady ? (
        <div className="flex h-full w-full items-center justify-center p-6 text-center">
          {/* Future Three.js <Canvas> will mount here dynamically */}
        </div>
      ) : fallbackImage ? (
        <div className="relative h-full w-full group">
          <Image
            src={fallbackImage}
            alt={fallbackAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 text-brand-clay mb-2" />
          <p className="font-mono text-xs">{title || "Interactive 3D Stage"}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-1">WebGL canvas viewport ready</p>
        </div>
      )}
    </div>
  );
}
