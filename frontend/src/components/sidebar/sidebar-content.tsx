"use client";

import { SquarePen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/common/logo";
import { ConversationList } from "@/components/sidebar/conversation-list";
import { SidebarSearch } from "@/components/sidebar/sidebar-search";
import { UserMenu } from "@/components/sidebar/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APP, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useConversations } from "@/lib/hooks/use-conversations";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data, isLoading } = useConversations(debouncedSearch);

  const conversations = data?.conversations ?? [];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Link
          href={ROUTES.home}
          onClick={onNavigate}
          className="flex items-center gap-2"
        >
          <Logo size={28} />
          <span className="text-base font-semibold tracking-tight">
            {APP.name}
          </span>
        </Link>
      </div>

      {/* New chat */}
      <div className="px-2 pb-2">
        <Link
          href={ROUTES.home}
          onClick={onNavigate}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-start gap-2 bg-sidebar-accent/30",
          )}
        >
          <SquarePen className="size-4" />
          New chat
        </Link>
      </div>

      <div className="pb-2">
        <SidebarSearch value={search} onChange={setSearch} />
      </div>

      {/* List */}
      <ScrollArea className="min-h-0 flex-1 scrollbar-thin">
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          searching={debouncedSearch.length > 0}
          onNavigate={onNavigate}
        />
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <UserMenu />
      </div>
    </div>
  );
}
