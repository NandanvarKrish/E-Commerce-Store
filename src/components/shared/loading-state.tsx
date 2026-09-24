import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading collection...",
  minHeight = "min-h-[350px]",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center animate-fade-in",
        minHeight,
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand-olive" />
      <p className="mt-3 font-mono text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
