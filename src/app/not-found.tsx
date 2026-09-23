import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-16">
      <Container className="text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-brand-copper">
          404 Error
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-brand-forest sm:text-5xl">
          Page Not Found
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          The page or product you are looking for has been moved, curated into a new collection, or does not exist.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className={buttonVariants({ variant: "default" })}>
            Return to Storefront
          </Link>
          <Link href="/products" className={buttonVariants({ variant: "outline" })}>
            Browse Catalog
          </Link>
        </div>
      </Container>
    </div>
  );
}
