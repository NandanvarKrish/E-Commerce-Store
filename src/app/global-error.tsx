"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#fefae0] text-[#283618] p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">System Encountered a Critical Error</h1>
        <p className="mt-2 max-w-md text-sm text-stone-600">
          A critical system error occurred. We apologize for the inconvenience.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-md bg-[#606c38] px-5 py-2.5 text-sm font-medium text-[#fefae0] hover:bg-[#606c38]/90 transition-colors"
        >
          Reload Application
        </button>
      </body>
    </html>
  );
}
