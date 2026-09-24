import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number; // e.g. 4.8
  max?: number;
  count?: number; // review count e.g. 38
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  value,
  max = 5,
  count,
  showScore = false,
  size = "md",
  className,
}: RatingProps) {
  const stars = Array.from({ length: max }, (_, index) => {
    const starValue = index + 1;
    const isFull = value >= starValue;
    const isHalf = !isFull && value >= starValue - 0.5;

    return { index, isFull, isHalf };
  });

  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5 text-brand-clay">
        {stars.map(({ index, isFull, isHalf }) => (
          <span key={index} className="relative inline-block">
            <Star
              className={cn(
                starSizes[size],
                isFull
                  ? "fill-brand-clay text-brand-clay"
                  : isHalf
                  ? "fill-brand-clay/50 text-brand-clay"
                  : "fill-transparent text-brand-forest/20"
              )}
            />
          </span>
        ))}
      </div>

      {showScore && (
        <span className="font-mono text-xs font-semibold text-brand-forest">
          {value.toFixed(1)}
        </span>
      )}

      {typeof count === "number" && (
        <span className="font-mono text-xs text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  );
}
