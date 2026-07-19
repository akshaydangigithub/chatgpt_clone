"use client";

import { useEffect, useState } from "react";

/** Subscribe to a CSS media query. SSR-safe (returns false on the server). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True on viewports narrower than the Tailwind `md` breakpoint. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
