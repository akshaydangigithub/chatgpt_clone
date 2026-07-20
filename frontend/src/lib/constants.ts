
export const APP = {
  name: "Nova Chat",
  tagline: "Your intelligent AI companion",
  description:
    "A fast, elegant AI chat experience powered by Google Gemini.",
} as const;

export const AUTH_STORAGE_KEY = "nova-chat-auth";

export const AUTH_COOKIE_KEY = "nova-chat-authed";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  conversation: (id: string) => `/c/${id}`,
} as const;

export const CONVERSATIONS_PAGE_SIZE = 20;

export const SUGGESTED_PROMPTS = [
  {
    title: "Explain a concept",
    subtitle: "Quantum computing in simple terms",
    prompt: "Explain quantum computing in simple terms with an analogy.",
  },
  {
    title: "Write some code",
    subtitle: "A debounce hook in TypeScript",
    prompt: "Write a reusable useDebounce hook in TypeScript with an example.",
  },
  {
    title: "Brainstorm ideas",
    subtitle: "Names for a productivity app",
    prompt: "Brainstorm 10 memorable names for a productivity app.",
  },
  {
    title: "Plan something",
    subtitle: "A 3-day trip to Kyoto",
    prompt: "Plan a detailed 3-day itinerary for a trip to Kyoto, Japan.",
  },
] as const;
