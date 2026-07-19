"use client";

import { useEffect, useState } from "react";

/** Returns true only after the first client render — guards hydration. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // Intentional: flip to `true` after the first client render so we can guard
  // theme-dependent UI from hydration mismatches. The single re-render is the
  // whole point of this hook.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}
