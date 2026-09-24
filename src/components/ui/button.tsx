import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-olive text-brand-cornsilk hover:bg-brand-olive/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-brand-forest/20 bg-transparent text-brand-forest hover:bg-brand-forest/5",
        secondary:
          "bg-brand-clay text-brand-forest hover:bg-brand-clay/90 shadow-sm",
        ghost:
          "text-brand-forest hover:bg-brand-forest/5",
        link:
          "text-brand-olive underline-offset-4 hover:underline",
        copper:
          "bg-brand-copper text-brand-cornsilk hover:bg-brand-copper/90 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const computedClass = cn(buttonVariants({ variant, size, className }));

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
      }>;
      return React.cloneElement(child, {
        className: cn(computedClass, child.props.className),
        children: (
          <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
            {child.props.children}
          </>
        ),
      });
    }

    return (
      <button
        className={computedClass}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
