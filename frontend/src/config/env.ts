function required(value: string | undefined, fallback: string): string {
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  apiUrl: required(process.env.NEXT_PUBLIC_API_URL, "http://localhost:8000").replace(
    /\/$/,
    "",
  ),
  appName: required(process.env.NEXT_PUBLIC_APP_NAME, "Nova Chat"),
} as const;

export type Env = typeof env;
