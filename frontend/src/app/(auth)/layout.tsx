"use client";

import { motion } from "framer-motion";

import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Loader } from "@/components/common/loader";
import { APP } from "@/lib/constants";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";

const HIGHLIGHTS = [
  "Real-time streaming responses",
  "Persistent, searchable chat history",
  "Beautiful light & dark themes",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized, hydrated } = useAuthGuard("guest");

  // While rehydrating, or if already authed (about to redirect), show a loader.
  if (!hydrated || !authorized) {
    return <Loader fullscreen label="Loading" />;
  }

  return (
    <div className="grid h-full w-full lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_20%,rgba(255,255,255,0.18),transparent)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <Logo size={40} className="shadow-none" />
            <span className="text-xl font-semibold tracking-tight">
              {APP.name}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-md space-y-6"
          >
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Think faster with your intelligent AI companion.
            </h1>
            <ul className="space-y-3 text-white/90">
              {HIGHLIGHTS.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-white/20 text-sm">
                    ✓
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} {APP.name}. Built with Next.js &
            Gemini.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex h-full items-center justify-center overflow-y-auto p-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <Logo size={44} />
            <span className="text-lg font-semibold">{APP.name}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
