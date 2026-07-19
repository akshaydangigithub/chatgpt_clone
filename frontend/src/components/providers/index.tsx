"use client";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthHydration } from "./auth-hydration";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <TooltipProvider delay={200}>
          <AuthHydration />
          {children}
          <Toaster position="top-center" richColors closeButton />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
