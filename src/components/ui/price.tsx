import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatters";

interface PriceProps {
  amount: number;
  compareAtAmount?: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSavings?: boolean;
}

export function Price({
  amount,
  compareAtAmount,
  currency = "USD",
  size = "md",
  className,
  showSavings = false,
}: PriceProps) {
  const isDiscounted = compareAtAmount && compareAtAmount > amount;
  const savingsPercent = isDiscounted
    ? Math.round(((compareAtAmount - amount) / compareAtAmount) * 100)
    : 0;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-2xl font-bold",
  };

  return (
    <div className={cn("inline-flex items-baseline gap-2 font-mono", className)}>
      <span className={cn("font-medium text-brand-forest", sizeClasses[size])}>
        {formatCurrency(amount, currency)}
      </span>

      {isDiscounted && (
        <span className="text-xs text-muted-foreground line-through decoration-brand-copper/60">
          {formatCurrency(compareAtAmount, currency)}
        </span>
      )}

      {showSavings && isDiscounted && (
        <span className="rounded bg-brand-copper/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-copper">
          -{savingsPercent}%
        </span>
      )}
    </div>
  );
}
