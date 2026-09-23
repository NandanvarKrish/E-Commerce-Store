import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <Loader2 className="h-10 w-10 animate-spin text-brand-olive" />
      <p className="mt-4 text-sm font-mono text-brand-forest/60">
        Loading experience...
      </p>
    </div>
  );
}
