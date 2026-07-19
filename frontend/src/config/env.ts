/**
 * Centralised, type-safe access to public environment variables.
 *
 * Everything here is `NEXT_PUBLIC_*` because it is consumed in the browser.
 * Keep this the single source of truth so we never sprinkle `process.env`
 * lookups across the codebase.
 */

function required(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  /** Base URL of the FastAPI backend, without a trailing slash. */
  apiUrl: required(process.env.NEXT_PUBLIC_API_URL, "http://localhost:8000").replace(
    /\/$/,
    "",
  ),
  /** Product name shown across the UI. */
  appName: required(process.env.NEXT_PUBLIC_APP_NAME, "Nova Chat"),
} as const;

export type Env = typeof env;
