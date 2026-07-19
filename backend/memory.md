# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using FastAPI + Gemini while learning AI Engineering step by step.

---

# Current Progress

## ✅ Completed

### Foundation

- FastAPI project structure
- Environment configuration (`pydantic-settings`)
- Dependency Injection
- PostgreSQL
- SQLAlchemy ORM
- Alembic migrations
- Repository / Service architecture
- Centralized configuration

---

### Database

- Conversation model
- Message model
- Relationships
- Database migrations

---

### API

- Create Conversation
- Chat Endpoint
- Streaming Chat Endpoint

### Conversation Management

Implemented:

- ✅ Create Conversation
- ✅ Get Conversation by ID
- ✅ List Conversations
- ✅ Rename Conversation
- ✅ Delete Conversation

REST API endpoints:

- `POST /conversations`
- `GET /conversations`
- `PATCH /conversations/{conversation_id}`
- `DELETE /conversations/{conversation_id}`

Production improvements:

- Correct REST status codes
- `204 No Content` for delete
- Request/Response schemas
- Transaction commits moved to Route layer
- Empty conversation list returns `[]` instead of an error
- Business errors handled through custom exceptions

---

### Services

#### ConversationService

Implemented:

- Create conversation
- Get conversation
- List conversations
- Rename conversation
- Delete conversation
- Generate title (heuristic) — now used only as the fallback when AI
  title generation fails

Current responsibility:

- All conversation business logic
- No transaction ownership
- Routes/Orchestrators perform commit()

---

#### MessageService

- Save messages
- Load conversation history

---

#### ChatService

Implemented:

- Validate conversation
- Save user message
- Load history
- Build provider history
- Call AI provider
- Save assistant response
- Generate conversation title
- Transaction management
- Rollback on failure
- Streaming orchestration

Refactoring completed:

- Removed duplicated conversation title generation logic.
- Introduced helper/private workflow to avoid duplicate code.
- Conversation title generated only once after successful AI response.

AI title wiring (this session):

- `generate_response` is now `async def` (title call is async → async is
  contagious up to the route, which now `await`s it).
- Blocking sync provider call wrapped in `asyncio.to_thread(...)` so the
  ~3s Gemini call does not stall the event loop.
- `_generate_conversation_title(db, request, assistant_message)` calls
  `await self.provider.generate_title(...)`, with a heuristic snippet
  fallback if the AI call raises `AIServiceError`.
- Both endpoints (JSON `/chat/` and SSE `/chat/stream`) share this helper.

---

### AI Provider Pattern

Implemented:

```
ChatService
      │
      ▼
AIProvider
      │
      ▼
FallbackProvider
      │
      ▼
GeminiProvider
```

Business logic remains provider-independent.

---

### AI Provider Architecture (Refactored — 3 layers)

Separation of "what" vs "how":

```
base.py              → AIProvider          (interface / contract only)
      │ implements
base_provider.py     → BaseAIProvider      (shared cross-cutting logic)
      │ inherits
gemini_provider.py   → GeminiProvider      (Gemini-specific calls only)
fallback_provider.py → FallbackProvider    (ordered provider fallback)
```

Contract (`AIProvider`, all `@abstractmethod`):

- generate_response()
- stream_response()
- generate_title()   ← added this session

`BaseAIProvider` (Template Method pattern):

- Stores CircuitBreaker + logger.
- `_execute_sync()` / `_execute_async()` / `_execute_stream()` wrap every
  call with: before_request → log → run → record_success / record_failure.
- `_map_exception()` moved here (raw SDK/vendor error → custom AI exception).
- Concrete providers pass their vendor call in as a closure (`func`); the base
  owns *when* to run it, the provider owns *what* it is.

Retry stays provider-specific (each vendor tunes its own policy), so it lives
in `gemini_provider.py`, not the base.

Files renamed: `gemini.py → gemini_provider.py`, `fallback.py → fallback_provider.py`.

---

### GeminiProvider

Implemented:

- Shared Gemini client
- Structured JSON output
- AIResponse schema
- Retry (Tenacity) — provider-specific decorator `gemini_retry`
- AI-powered conversation title generation (`generate_title`)
- Native async streaming
- Plain text chunk streaming

Now contains *only* Gemini-specific code. Cross-cutting concerns (circuit
breaker, logging, exception mapping) delegated to `BaseAIProvider`.

Private helpers (Gemini-specific):

- `_validate_response()` — never trust the provider (Phase 8)
- `_build_title_prompt()` — prompt kept out of the method body
- `_normalize_title()` — strips quotes / trailing punctuation in either order

Provider Rule:

- Provider returns plain text only.
- No SSE formatting.
- No HTTP knowledge.

---

### Streaming

Implemented:

- Async StreamingResponse
- Async generators
- Native Gemini async streaming
- Producer task
- Heartbeat task
- asyncio.Queue
- Transaction-safe persistence
- Response persistence after stream completion

Current architecture:

```
GeminiProvider
        │
        ▼
Producer Task
        │
        ▼
asyncio.Queue
        ▲
Heartbeat Task
        │
        ▼
ChatService
        │
        ▼
StreamingResponse
```

---

### Server-Sent Events (SSE)

Implemented:

- text/event-stream
- Generic SSE formatter
- Message events
- Heartbeat events
- End events
- Error events
- Proper SSE headers

Utility:

```
app/utils/sse.py
```

Contains:

- format_message()
- format_heartbeat()
- format_done()
- format_error()

---

### Retry

- Tenacity
- Exponential Backoff
- Retry only recoverable errors

---

### Circuit Breaker

Implemented:

- CLOSED
- OPEN
- HALF_OPEN

---

### Logging

Implemented:

- Rich Logging
- ContextVars
- Request ID
- Uvicorn integration

---

### Middleware

Implemented:

- Request ID middleware
- Response headers
- Context cleanup

---

### Error Handling

Implemented:

- AIServiceError
- AIRateLimitError
- AIAuthenticationError
- AIInvalidResponseError
- AITimeoutError
- AICircuitOpenError
- ConversationNotFoundError

---

### Dependency Injection

Fully injected:

- Database
- Gemini Client
- Circuit Breaker
- GeminiProvider
- FallbackProvider
- Services

---

# Architecture Principles Learned

- Layered Architecture
- Service Layer
- Dependency Injection
- Provider Pattern
- Provider Fallback
- Template Method Pattern (BaseAIProvider `_execute_*` helpers)
- Shared base class vs interface (base_provider.py vs base.py)
- Closures / passing behavior as an argument
- Async is contagious (await propagates up the call chain)
- asyncio.to_thread (run blocking sync work off the event loop)
- Unit of Work
- Transaction Management
- Retry Pattern
- Circuit Breaker
- Exception Mapping
- Streaming Architecture
- Async Programming
- Async Generators
- asyncio.Queue
- Producer-Consumer Pattern
- Heartbeat Pattern
- Server-Sent Events
- Separation of Concerns
- Business Orchestration

---

# Production Concepts Learned

- Retry
- Fail Fast
- Circuit Breaker
- Exponential Backoff
- Structured Logging
- Request Correlation
- Async Streaming
- Async Iterators
- Async Generators
- asyncio.Queue
- Producer/Consumer
- Heartbeat
- SSE Protocol
- Transaction-safe Streaming

---

# Current Streaming Flow

```
Browser
    │
    ▼
StreamingResponse
    │
    ▼
ChatService
    │
    ├── Producer Task
    ├── Heartbeat Task
    └── Queue Consumer
    │
    ▼
GeminiProvider
    │
    ▼
Gemini API
```

---

# Next Learning Steps

Continue in this order.

## 1. Improve Conversation Management

Remaining:

- Pagination
- Search
- Recent conversations ordering
- Soft Delete (optional)
- Archive conversations (optional)

Done:

- ✅ AI-based Title Generation (Gemini, with heuristic fallback)

---

## 2. Authentication

Implement:

- JWT
- User model
- User authentication
- User conversations
- Ownership validation

---

## 3. Production Readiness

Implement:

- Docker
- Docker Compose
- Environment separation
- Health Checks
- Metrics
- OpenTelemetry
- Prometheus
- CI/CD
- Deployment

---

# Teaching Style Reminder

Continue acting as a Senior AI Engineer mentoring a Junior Developer.

Rules:

- Keep theory concise.
- Explain why before coding.
- Let me implement first.
- Follow production architecture.
- Compare with Node.js whenever useful.
- Focus on production-quality design instead of shortcuts.

---

# Current State

The backend now supports:

- Clean Layered Architecture
- Service Layer
- Dependency Injection
- Provider Pattern
- Retry
- Circuit Breaker
- Exception Mapping
- Structured Logging
- Request Correlation
- Async Streaming
- Producer/Consumer Queue
- Heartbeat Streaming
- Production SSE
- Conversation CRUD
- AI-Powered Conversation Title (Gemini, heuristic fallback)
- Transaction-safe Streaming
- Provider-independent Business Logic
- 3-Layer Provider Architecture (interface / shared base / concrete)

---

# Next Milestone

1. Pagination.
2. Search conversations.
3. JWT Authentication.
4. User ownership.
5. Production deployment.

Optional follow-up: run AI title generation as a background task so the
first response isn't delayed by the extra Gemini round-trip.
