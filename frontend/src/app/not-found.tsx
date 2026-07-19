import Link from "next/link";

import { Logo } from "@/components/common/logo";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="bg-aurora flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size={56} />
      <div className="space-y-2">
        <h1 className="text-5xl font-semibold tracking-tight">404</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find the page you were looking for.
        </p>
      </div>
      <Link href={ROUTES.home} className={buttonVariants()}>
        Back to chat
      </Link>
    </div>
  );
}
