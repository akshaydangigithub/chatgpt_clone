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
- Generate title (heuristic)

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

### GeminiProvider

Implemented:

- Shared Gemini client
- Structured JSON output
- AIResponse schema
- Retry (Tenacity)
- Circuit Breaker
- Exception Mapping
- Native async streaming
- Plain text chunk streaming

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

- AI-based Title Generation
- Pagination
- Search
- Recent conversations ordering
- Soft Delete (optional)
- Archive conversations (optional)

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
- Auto Conversation Title (Heuristic)
- Transaction-safe Streaming
- Provider-independent Business Logic

---

# Next Milestone

1. AI-powered conversation title generation.
2. Pagination.
3. Search conversations.
4. JWT Authentication.
5. User ownership.
6. Production deployment.
