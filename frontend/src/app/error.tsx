"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the console for debugging.
    console.error(error);
  }, [error]);

  return (
    <div className="bg-aurora flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">
            Reference: {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
