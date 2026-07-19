# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using FastAPI + Gemini
while learning AI Engineering step by step.

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

### Database

- Conversation model
- Message model
- Relationships
- Database migrations

### API

- Create Conversation
- Chat Endpoint
- Streaming Chat Endpoint

### Services

#### ConversationService

- Create conversation
- Get conversation by ID

#### MessageService

- Save messages
- Load conversation history

#### ChatService

- Validate conversation
- Save user message
- Load conversation history
- Build provider history
- Call AI Provider
- Save assistant response
- Transaction management
- Rollback on failure
- Streaming orchestration

### AI Provider Pattern

Implemented:

ChatService → AIProvider → FallbackProvider → GeminiProvider

Business logic is provider-agnostic.

### GeminiProvider

- Shared Gemini client
- Structured JSON output
- AIResponse schema
- Retry (Tenacity)
- Circuit Breaker
- Exception Mapping
- Streaming support

Important architecture rule:

- GeminiProvider ONLY returns AI text.
- No HTTP/SSE formatting inside the provider.
- HTTP formatting belongs to ChatService.

### Streaming

Implemented: - StreamingResponse - Python generators - Incremental token
streaming - Response persistence - Transaction handling after stream
completion

### Retry

- Tenacity
- Exponential backoff
- Retry on recoverable errors
- No retry on authentication/validation errors

### Circuit Breaker

- CLOSED
- OPEN
- HALF_OPEN

### Logging

- Rich logging
- Request ID
- ContextVars
- Uvicorn integration

### Middleware

- Request ID middleware
- Response header
- Context cleanup

### Error Handling

- AIServiceError
- AIRateLimitError
- AIAuthenticationError
- AIInvalidResponseError
- AITimeoutError
- AICircuitOpenError
- ConversationNotFoundError

### Dependency Injection

Fully injected: - Database session - Gemini client - Circuit breaker -
GeminiProvider - FallbackProvider - Services

---

# ✅ NEW: Production-style Server-Sent Events (SSE)

Implemented:

- text/event-stream responses
- Proper SSE headers
- Generic SSE formatter
- Structured JSON events
- Message events
- End events
- Error events
- Clean separation of concerns

Current architecture:

FastAPI Route → StreamingResponse → ChatService → SSE Formatter →
AIProvider → GeminiProvider

## SSE Utility

app/utils/sse.py

Contains:

- format_sse(event, data)
- format_message(text)
- format_end()
- format_error(message)

Example output:

event: message data: {"text":"Hello"}

event: end data: {}

## ChatService responsibilities

During streaming:

- Receive plain text from provider
- Convert text into SSE events
- Yield formatted events
- Persist final response
- Emit end event
- Emit error event when failures occur

## GeminiProvider responsibilities

Provider only yields:

- Plain text chunks

It must NOT:

- Know about HTTP
- Know about SSE
- Format responses

This separation keeps the provider reusable for WebSockets, CLI, gRPC,
or any future transport.

---

# Architecture Principles Learned

- Layered Architecture
- Repository Pattern
- Service Layer
- Dependency Injection
- Provider Pattern
- Provider Fallback
- Unit of Work
- Transaction Management
- Exception Mapping
- Retry Pattern
- Circuit Breaker
- Streaming Architecture
- Server-Sent Events (SSE)
- Separation of Concerns
- Business Orchestration

---

# Production Concepts Learned

- Retry
- Circuit Breaker
- Fail Fast
- Exponential Backoff
- Structured Logging
- Request Correlation
- StreamingResponse
- Python Generators
- Iterator Pattern
- Token Streaming
- SSE Protocol
- text/event-stream
- JSON Event Streaming

---

# Current Streaming Flow

Browser → StreamingResponse → ChatService.stream_response() →
format_message() → GeminiProvider.stream_response() → Gemini API

Events returned:

- message
- end
- error

---

# Next Learning Steps

Continue in this order.

## 1. Improve SSE

Still remaining:

- Heartbeat events
- Event IDs
- Retry field
- Multi-line data support
- Browser EventSource
- fetch() streaming
- Frontend integration

## 2. Conversation Features

Implement:

- Auto Title Generation
- Rename Conversation
- Delete Conversation
- Conversation Listing
- Pagination
- Search

## 3. Authentication

Implement:

- JWT
- User model
- User conversations
- Ownership validation

## 4. Production Readiness

Implement:

- Docker
- Docker Compose
- Environment separation
- Health checks
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
- Compare with Node.js when useful.
- Focus on production-quality design rather than shortcuts.

---

# Current State

The backend now supports:

- Clean Layered Architecture
- Repository Pattern
- Service Layer
- Dependency Injection
- Provider Pattern
- Retry
- Circuit Breaker
- Exception Mapping
- Structured Logging
- Request Correlation
- Streaming AI Responses
- Production-style SSE
- JSON SSE Events
- Transaction-safe Streaming
- Provider-independent Business Logic

Next milestone:

1.  Complete advanced SSE features.
2.  Build Conversation Management.
3.  Add Authentication.
4.  Prepare the project for production deployment.
