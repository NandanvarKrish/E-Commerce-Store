import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-brand-forest/10 bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-forest/5">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/80 via-brand-forest/20 to-transparent transition-opacity duration-300 group-hover:from-brand-forest/90" />

        {/* Content pinned to bottom */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-brand-cornsilk flex flex-col justify-end">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-clay">
              {category.itemCount} items
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cornsilk/20 text-brand-cornsilk backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-brand-olive">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <h3 className="font-display text-xl font-bold tracking-tight text-brand-cornsilk group-hover:text-brand-clay transition-colors">
            {category.name}
          </h3>

          <p className="mt-1 text-xs text-brand-cornsilk/80 line-clamp-2 font-sans leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
