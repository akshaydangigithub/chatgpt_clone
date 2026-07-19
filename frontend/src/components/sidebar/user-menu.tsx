"use client";

import { LogOut, Monitor, Moon, Sun, User as UserIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/format";
import { useLogout } from "@/lib/hooks/use-auth";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useAuthStore } from "@/lib/store/auth-store";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const name = user?.username ?? "Account";
  const email = user?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-3 px-2 py-2"
          />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col items-start">
          <span className="max-w-[140px] truncate text-sm font-medium">
            {name}
          </span>
          {email && (
            <span className="max-w-[140px] truncate text-xs text-muted-foreground">
              {email}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-60">
        {/* Base UI requires GroupLabel to live inside a Group/RadioGroup. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2">
            <UserIcon className="size-4" />
            <span className="truncate">{name}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {mounted && (
          <>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 size-4" /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 size-4" /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="mr-2 size-4" /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
          <LogOut className="mr-2 size-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
