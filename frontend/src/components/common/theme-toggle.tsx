"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMounted } from "@/lib/hooks/use-mounted";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={className}
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          />
        }
      >
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "moon" : "sun"}
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              className="grid place-items-center"
            >
              {isDark ? (
                <Moon className="size-[18px]" />
              ) : (
                <Sun className="size-[18px]" />
              )}
            </motion.span>
          </AnimatePresence>
        ) : (
          <Sun className="size-[18px]" />
        )}
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  );
}
