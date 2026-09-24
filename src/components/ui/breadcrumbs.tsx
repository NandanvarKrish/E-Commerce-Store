import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs font-mono text-muted-foreground", className)}
    >
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-brand-forest transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="h-3 w-3 text-brand-forest/30 flex-shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-forest transition-colors truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-brand-forest truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
