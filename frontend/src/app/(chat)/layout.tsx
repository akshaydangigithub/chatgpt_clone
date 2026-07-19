"use client";

import { DesktopSidebar, MobileSidebar } from "@/components/sidebar/app-sidebar";
import { Loader } from "@/components/common/loader";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { useMe } from "@/lib/hooks/use-auth";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, hydrated } = useAuthGuard("protected");
  // Fetch the current user once authorised so avatars / greeting are populated.
  useMe();

  if (!hydrated || !authorized) {
    return <Loader fullscreen label="Loading" />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <DesktopSidebar />
      <MobileSidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
