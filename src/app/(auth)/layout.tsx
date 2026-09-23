import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-brand-cornsilk/40 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="font-display text-3xl font-bold tracking-tight text-brand-forest hover:text-brand-olive transition-colors"
        >
          {siteConfig.name}
        </Link>
        <p className="mt-1 font-accent text-sm text-brand-copper">
          Conscious living designed for the modern sanctuary
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {children}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">
          ← Return to Storefront
        </Link>
      </div>
    </div>
  );
}
