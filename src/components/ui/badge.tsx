import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-olive text-brand-cornsilk",
        secondary:
          "border-transparent bg-brand-clay text-brand-forest",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "border border-brand-forest/20 text-brand-forest",
        copper:
          "border-transparent bg-brand-copper text-brand-cornsilk",
        forest:
          "border-transparent bg-brand-forest text-brand-cornsilk",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
