import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Loader({
  label,
  fullscreen = false,
  className,
}: {
  label?: string;
  fullscreen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        fullscreen && "h-full w-full",
        className,
      )}
    >
      <Loader2 className="size-5 animate-spin" />
      {label && <span className="text-sm">{label}…</span>}
    </div>
  );
}
