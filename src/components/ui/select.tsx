import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="text-xs font-medium text-brand-forest">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              "flex h-10 w-full appearance-none rounded-md border border-brand-forest/20 bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-olive focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 font-sans",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-forest/60" />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
