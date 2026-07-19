"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { conversationTitle } from "@/lib/format";
import {
  useDeleteConversation,
  useRenameConversation,
} from "@/lib/hooks/use-conversations";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

export function ConversationItem({
  conversation,
  active,
  onNavigate,
}: {
  conversation: Conversation;
  active: boolean;
  onNavigate?: () => void;
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(conversationTitle(conversation));

  const rename = useRenameConversation();
  const remove = useDeleteConversation();

  const submitRename = () => {
    const next = title.trim();
    if (next && next !== conversation.title) {
      rename.mutate({ id: conversation.id, title: next });
    }
    setRenameOpen(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "group/item relative flex items-center rounded-lg text-sm transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
        )}
      >
        <Link
          href={ROUTES.conversation(conversation.id)}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-3 pr-1"
        >
          <span className="truncate">{conversationTitle(conversation)}</span>
        </Link>

        {/* Fade so long titles don't collide with the action button. */}
        <div
          className={cn(
            "pointer-events-none absolute right-8 top-0 h-full w-8 bg-gradient-to-l to-transparent",
            active
              ? "from-sidebar-accent"
              : "from-sidebar group-hover/item:from-sidebar-accent/60",
          )}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 size-7 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/item:opacity-100 data-[popup-open]:opacity-100"
                aria-label="Conversation options"
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => {
                setTitle(conversationTitle(conversation));
                setRenameOpen(true);
              }}
            >
              <Pencil className="mr-2 size-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitRename()}
            maxLength={255}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{conversationTitle(conversation)}&rdquo; and all its
              messages will be permanently removed. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove.mutate(conversation.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
