import * as React from "react";
import { FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-brand-forest/20 p-8 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-clay/20 text-brand-forest mb-4">
        {icon || <FolderX className="h-6 w-6" />}
      </div>
      <h3 className="text-lg font-medium text-brand-forest">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6" variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
