# Nova Chat

A full-stack, ChatGPT-style AI assistant built with **Next.js** and **FastAPI**, powered by **Google Gemini**. Responses stream token-by-token over Server-Sent Events, conversations are persisted per user, and the AI layer is wrapped in production-grade resilience (circuit breaker, retries, provider fallback).

This is not a thin wrapper around an LLM API — it's designed to behave like a real system: streaming stays consistent with the database, upstream failures degrade gracefully, and every request is traceable.

---

## Highlights

- **Real-time streaming** — token-by-token responses over SSE, reconciled with the database so the UI never shows a half-written or phantom state.
- **Resilient AI layer** — Gemini wrapped in a circuit breaker + retry policy, with an ordered fallback chain on top. A single flaky upstream call can't take a request down.
- **Persistent, per-user conversations** — JWT-authenticated accounts, message history, search, rename, and delete.
- **Auto-generated titles** — the first exchange of each conversation is titled by the model.
- **Clean architecture** — layered FastAPI services (`routes → services → providers`), request-ID tracing, and centralized exception handling.
- **Polished UI** — ChatGPT-style interface with dark mode, streaming markdown, syntax-highlighted code blocks, and date-grouped history.

---

## Tech Stack

**Frontend**
- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · Base UI / shadcn
- TanStack Query (server state) · Zustand (client state)
- Framer Motion · react-markdown + rehype-highlight
- Native `fetch` + `ReadableStream` for SSE streaming

**Backend**
- FastAPI · Python 3.12
- Google Gemini (`google-genai`)
- PostgreSQL · SQLAlchemy 2.x · Alembic
- JWT auth (`python-jose`, `passlib`/`bcrypt`)
- Resilience: circuit breaker, `tenacity` retries, provider fallback
- Structured logging (`rich`), request-ID middleware

---

## Architecture

```
┌─────────────────────────┐        SSE / REST         ┌──────────────────────────────┐
│        Frontend         │  ───────────────────────► │            Backend           │
│   Next.js 16 · React 19 │                           │            FastAPI           │
│                         │                           │                              │
│  TanStack Query ┐       │      JWT (Bearer)         │  routes → services → providers│
│  Zustand        ┘ state │  ◄──────────────────────► │       │                       │
│  SSE stream reader      │                           │       ▼                       │
└─────────────────────────┘                           │  Gemini provider              │
                                                       │   └ circuit breaker + retry   │
                                                       │  FallbackProvider (ordered)   │
                                                       │       │                       │
                                                       │       ▼                       │
                                                       │  PostgreSQL (SQLAlchemy)      │
                                                       └──────────────────────────────┘
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **PostgreSQL** 14+ (running locally or reachable via `DATABASE_URL`)
- A **Google Gemini API key** — https://aistudio.google.com/apikey

---

## Getting Started

Clone the repo:

```bash
git clone <your-repo-url>
cd chatgpt_clone
```

### 1. Database

Create a PostgreSQL database and user (adjust names to taste):

```bash
createdb chat_gpt_clone
```

### 2. Backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → edit .env and fill in the values below
```

Environment variables (`backend/.env`):

| Variable                      | Description                                              | Example                                                                 |
| ----------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| `GEMINI_API_KEY`              | Google Gemini API key                                   | `AIza...`                                                               |
| `GEMINI_MODEL`                | Gemini model id                                         | `gemini-2.0-flash`                                                      |
| `DATABASE_URL`                | PostgreSQL connection string                            | `postgresql+psycopg2://user:pass@localhost:5432/chat_gpt_clone`         |
| `SECRET_KEY`                  | Secret used to sign JWTs (use a long random string)     | `openssl rand -hex 32`                                                  |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime in minutes (default `30`)         | `30`                                                                    |
| `CORS_ORIGINS`                | Comma-separated allowed browser origins                 | `http://localhost:3000,http://127.0.0.1:3000`                          |

Run the migrations, then start the server:

```bash
# Apply database schema
alembic upgrade head

# Start the API (http://localhost:8000)
uvicorn app.main:app --reload
```

Interactive API docs are available at **http://localhost:8000/docs**.

### 3. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Create the local environment file (see variables below)
touch .env.local
```

Environment variables (`frontend/.env.local`):

| Variable                | Description                              | Example                 |
| ----------------------- | ---------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL`   | Base URL of the FastAPI backend          | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME`  | Product name shown across the UI         | `Nova Chat`             |

Start the dev server:

```bash
npm run dev
```

Open **http://localhost:3000**, register an account, and start chatting.

---

## API Overview

Base URL: `http://localhost:8000`

| Method   | Endpoint                             | Description                                  | Auth |
| -------- | ------------------------------------ | -------------------------------------------- | :--: |
| `POST`   | `/auth/register`                     | Create a new account                         |  —   |
| `POST`   | `/auth/login`                        | Obtain a JWT access token                    |  —   |
| `GET`    | `/auth/me`                           | Current authenticated user                   |  ✅  |
| `GET`    | `/conversations/`                    | List conversations (paginated, searchable)   |  ✅  |
| `POST`   | `/conversations/`                    | Create a conversation                        |  ✅  |
| `GET`    | `/conversations/{id}/messages`       | Fetch messages for a conversation            |  ✅  |
| `PATCH`  | `/conversations/{id}`                | Rename a conversation                        |  ✅  |
| `DELETE` | `/conversations/{id}`                | Delete a conversation                        |  ✅  |
| `POST`   | `/chat/`                             | Non-streaming completion                     |  ✅  |
| `POST`   | `/chat/stream`                       | Streaming completion (SSE)                   |  ✅  |

Authenticated requests expect an `Authorization: Bearer <token>` header.

---

## Project Structure

```
chatgpt_clone/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # auth, chat, conversation endpoints
│   │   ├── core/            # config, database, security, logging, circuit breaker
│   │   ├── providers/       # Gemini provider, fallback provider
│   │   ├── services/        # chat, conversation, message, user services
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── middleware/      # request-id tracing
│   │   └── main.py          # FastAPI app entrypoint
│   ├── alembic/             # database migrations
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/             # Next.js App Router pages
        ├── components/      # chat, sidebar, auth, ui
        ├── lib/             # api clients, hooks, stores, query keys
        └── types/           # API/type contracts
```

---

## Roadmap

Nova Chat is the foundation, not the finished product. Planned next:

- **RAG** — chat grounded in your own documents
- **Long-term memory** — context that persists across conversations
- **Multi-model support** — switch and fall back across providers
- Hosted live demo

---

## License

This project is for learning and demonstration purposes.
