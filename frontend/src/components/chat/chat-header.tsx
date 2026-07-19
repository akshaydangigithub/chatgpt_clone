"use client";

import { PanelLeft, SquarePen } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/lib/constants";
import { useUIStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

export function ChatHeader({ title }: { title: string }) {
  const openMobileSidebar = useUIStore((s) => s.setMobileSidebarOpen);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 md:px-4">
      {/* Mobile sidebar trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => openMobileSidebar(true)}
        aria-label="Open sidebar"
      >
        <PanelLeft className="size-5" />
      </Button>

      <h1 className="min-w-0 flex-1 truncate text-sm font-medium md:text-base">
        {title}
      </h1>

      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={ROUTES.home}
              aria-label="New chat"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden",
              )}
            />
          }
        >
          <SquarePen className="size-5" />
        </TooltipTrigger>
        <TooltipContent>New chat</TooltipContent>
      </Tooltip>

      <ThemeToggle />
    </header>
  );
}
