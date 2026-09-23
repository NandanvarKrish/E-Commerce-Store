"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-3" />
      <h3 className="text-lg font-semibold text-brand-forest">
        Admin Console Error
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {error.message || "Failed to load admin module."}
      </p>
      <Button onClick={() => reset()} className="mt-6" variant="default">
        Retry Operation
      </Button>
    </div>
  );
}
