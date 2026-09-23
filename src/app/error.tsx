"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring services (e.g. Sentry or console)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-16">
      <Container className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-bold text-brand-forest sm:text-3xl">
          Something went wrong
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred while rendering this section."}
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/60">
            Digest: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => reset()} variant="default">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            Go to Home
          </Button>
        </div>
      </Container>
    </div>
  );
}
