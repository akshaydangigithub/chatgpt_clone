# Nova Chat — Frontend

A production-ready **ChatGPT-style** web client for the FastAPI + Gemini backend
in [`../backend`](../backend). Built with **Next.js 16 (App Router)**,
**TypeScript**, **Tailwind CSS v4**, **shadcn/ui (Base UI)**, **TanStack Query**,
**Zustand**, and **Framer Motion**.

<br/>

## ✨ Features

- **Streaming responses** over SSE (token-by-token, with a stop button)
- **Auth** — register / login (JWT), protected routes, auto sign-in after signup
- **Conversation management** — create, list, **search**, **rename**, **delete**
  (all with optimistic updates)
- **Persistent history** — messages load per conversation, grouped by date in the
  sidebar (Today / Yesterday / Previous 7 days / …)
- **Rich markdown** rendering with GFM tables, syntax-highlighted code blocks, and
  one-click copy
- **Light / dark / system themes** with an animated toggle
- **Responsive** — collapsible sidebar becomes a mobile drawer
- **Polished UX** — Framer Motion transitions, typing indicator, auto-scroll with
  jump-to-latest, skeleton loaders, toasts, empty-state prompt suggestions

<br/>

## 🚀 Getting started

```bash
# 1. Install
npm install

# 2. Configure — point at your running backend
cp .env.example .env.local
#   NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Run
npm run dev        # http://localhost:3000
```

> Make sure the backend is running (`uvicorn app.main:app --reload` in
> `../backend`) and that its `CORS_ORIGINS` includes `http://localhost:3000`
> (already the default).

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`.

<br/>

## 🧱 Architecture & folder structure

```
src/
├── app/                          # App Router
│   ├── (auth)/                   # Guest-only group (redirects if signed in)
│   │   ├── layout.tsx            #   split-screen brand + form shell
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (chat)/                   # Protected group (redirects if signed out)
│   │   ├── layout.tsx            #   sidebar + main shell
│   │   ├── page.tsx              #   "/"  → new-chat landing
│   │   └── c/[id]/page.tsx       #   "/c/:id" → conversation
│   ├── layout.tsx                # root: fonts, metadata, providers
│   ├── not-found.tsx
│   └── globals.css               # theme tokens, prose, hljs, scrollbars
│
├── components/
│   ├── auth/                     # login/register forms, password input
│   ├── chat/                     # window, messages, input, markdown, code block…
│   ├── sidebar/                  # rail, list, item, search, user menu
│   ├── common/                   # logo, loader, theme toggle
│   ├── providers/                # Query + Theme + Tooltip + Toaster + hydration
│   └── ui/                       # shadcn/ui primitives (Base UI)
│
├── lib/
│   ├── api/                      # axios client + typed service modules
│   │   ├── client.ts             #   interceptors (auth header, 401 handling)
│   │   ├── auth.ts  conversations.ts
│   │   └── stream.ts             #   fetch-based SSE reader (POST + Bearer)
│   ├── hooks/                    # useChat, useConversations, useAuth, …
│   ├── query/                    # QueryClient factory + query keys
│   ├── store/                    # zustand: auth, ui, pending-message bridge
│   ├── validation/               # zod schemas
│   ├── constants.ts  format.ts  utils.ts
│
├── config/env.ts                 # typed public env access
└── types/                        # api.ts (backend mirrors) + chat.ts
```

### Key design decisions

| Concern | Approach |
|---|---|
| **Server state** | TanStack Query owns conversations & messages; centralized keys in `lib/query/keys.ts`. |
| **Client state** | Zustand for auth (persisted), UI (sidebar), and a small "pending message" bridge. |
| **Streaming** | Native `EventSource` can't send a `POST` with a bearer token, so `lib/api/stream.ts` uses `fetch` + a `ReadableStream` reader and parses SSE frames by hand (handling `message` / `done` / `error` events and heartbeats). |
| **First message flow** | `/` creates the conversation, stashes the prompt in a Zustand store keyed by id, then navigates to `/c/:id`, which *consumes* it and starts streaming — so the first prompt survives the route change. |
| **Optimistic chat** | `useChat` merges persisted history with in-flight drafts, then invalidates & reconciles once generation completes. |
| **Auth gating** | The token lives in `localStorage` (needed by the axios interceptor), so route protection is client-side via `useAuthGuard` after store rehydration. |
| **Roles** | The backend stores the assistant as `"model"`; `types/chat.ts` normalizes it to `"assistant"` for the UI. |

<br/>

## 🔌 Backend integration

Every backend endpoint is wired up:

| UI action | Endpoint |
|---|---|
| Register / Login / Session | `POST /auth/register`, `POST /auth/login` (form-encoded), `GET /auth/me` |
| Sidebar list + search + pagination | `GET /conversations/?page&page_size&search_query` |
| New chat | `POST /conversations/` |
| Rename / Delete | `PATCH` / `DELETE /conversations/{id}` |
| Load history | `GET /conversations/{id}/messages` |
| Send + stream reply | `POST /chat/stream` (SSE) |

> Two small backend additions were required for a functional client and are
> included in `../backend`: a **CORS middleware** and the
> **`GET /conversations/{id}/messages`** endpoint.
