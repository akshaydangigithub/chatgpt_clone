"use client";

import { SidebarContent } from "@/components/sidebar/sidebar-content";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUIStore } from "@/lib/store/ui-store";

/** Desktop rail — a fixed-width column, hidden on mobile. */
export function DesktopSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-sidebar-border md:block">
      <SidebarContent />
    </aside>
  );
}

/** Mobile drawer — a Sheet driven by the UI store. */
export function MobileSidebar() {
  const open = useUIStore((s) => s.mobileSidebarOpen);
  const setOpen = useUIStore((s) => s.setMobileSidebarOpen);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
