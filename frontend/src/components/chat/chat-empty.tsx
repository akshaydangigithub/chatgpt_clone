"use client";

import { motion } from "framer-motion";

import { Logo } from "@/components/common/logo";
import { SUGGESTED_PROMPTS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/auth-store";

export function ChatEmpty({
  onPick,
}: {
  onPick: (prompt: string) => void;
}) {
  const username = useAuthStore((s) => s.user?.username);

  return (
    <div className="bg-aurora flex h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <Logo size={56} className="mb-5" />
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {username ? (
              <>
                Hello,{" "}
                <span className="text-gradient">{username}</span>
              </>
            ) : (
              "How can I help you today?"
            )}
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Ask anything — from quick facts to deep dives. Pick a starter below
            or type your own message.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((item, i) => (
            <motion.button
              key={item.title}
              type="button"
              onClick={() => onPick(item.prompt)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className="group rounded-xl border border-border bg-card/60 p-4 text-left transition-colors hover:border-ring/50 hover:bg-accent/50"
            >
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.subtitle}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
