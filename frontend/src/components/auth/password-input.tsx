"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Input>;

/** A password field with an inline show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
