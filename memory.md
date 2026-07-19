# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using FastAPI + Gemini while learning AI Engineering step by step.

---

# Current Progress

## ✅ Completed

### Project Foundation

- FastAPI project structure
- Environment configuration using `pydantic-settings`
- Dependency Injection
- PostgreSQL integration
- SQLAlchemy ORM
- Alembic migrations
- Repository/Service style architecture
- Centralized configuration

---

### Database Models

Completed models:

- Conversation
- Message

Implemented relationships and database migrations.

---

### API Layer

Implemented endpoints:

- Create Conversation
- Chat Endpoint

Using:

- Request/Response Schemas
- Dependency Injection
- Proper Response Models

---

### Services

Implemented:

#### ConversationService

Responsible for:

- Create conversation
- Get conversation by ID

#### MessageService

Responsible for:

- Save messages
- Load conversation history

#### ChatService

Responsible for:

- Validate conversation
- Save user message
- Build conversation history
- Call AI Provider
- Save assistant response
- Transaction management
- Rollback on failure

ChatService now has **no Gemini-specific code**.

---

### AI Provider Architecture

Refactored to Provider Pattern.

Created:

```
app/providers/
    base.py
    gemini.py
```

`AIProvider` is now an abstraction.

```
ChatService
      │
      ▼
AIProvider
      │
      ▼
GeminiProvider
```

This allows future providers such as:

- OpenAI
- Claude
- Groq
- Ollama

without changing ChatService.

---

### GeminiProvider

Implemented:

- Shared GenAI client
- Response schema (`AIResponse`)
- Structured JSON output
- Provider abstraction
- Logging
- Retry support using Tenacity

---

### Retry Mechanism

Using:

```
tenacity
```

Configured:

- Exponential Backoff
- Maximum retry attempts
- Retry only on `AIServiceError`
- Retry logging using `before_sleep_log`

---

### Logging

Implemented production-style structured logging.

Features:

- JSON logs
- Request ID using `contextvars`
- Logging Filter
- Custom Formatter
- Automatic Request ID injection
- Central logging configuration

Every request now has a traceable Request ID.

---

### Request Middleware

Implemented:

- UUID Request ID generation
- ContextVar integration
- Response header (`X-Request-ID`)
- Request lifecycle cleanup

---

### Error Handling

Custom exceptions:

- AIServiceError
- AIRateLimitError
- AIAuthenticationError
- AIInvalidResponseError
- AITimeoutError
- ConversationNotFoundError

Proper rollback handling inside ChatService.

---

### Transaction Pattern

Current design:

- Services do **not** own transactions.
- Routes/Application layer own commits.
- Services use `flush()`/`refresh()` when database-generated values are required before commit.
- ChatService performs a single transaction for the complete chat workflow.

This follows a Unit of Work style architecture.

---

## Important Architectural Decisions

### 1. Provider Pattern

Business logic never imports Gemini SDK directly.

```
ChatService
      ↓
AIProvider
      ↓
GeminiProvider
```

---

### 2. Separation of Responsibilities

ConversationService

- Conversation CRUD

MessageService

- Message persistence

ChatService

- Chat orchestration only

GeminiProvider

- AI communication only

---

### 3. Dependency Injection

Shared objects are injected.

Examples:

- Database Session
- Gemini Client
- AI Provider
- Services

---

### 4. Structured Logging

Every log includes:

- Timestamp
- Level
- Logger
- Request ID
- Message

---

### 5. Retry Logic

Retry belongs inside the Provider layer, not inside ChatService.

Reason:

External API resilience is the provider's responsibility.

---

## Next Learning Steps

Continue in this order:

### 1. Complete Gemini Provider Hardening

- Proper timeout handling
- Exception mapping
- Convert SDK exceptions into domain exceptions

---

### 2. Circuit Breaker Pattern

Protect the application from repeatedly calling an unhealthy AI provider.

---

### 3. Provider Fallback

Example:

```
Gemini
    ↓
OpenAI
    ↓
Claude
```

---

### 4. Streaming Responses

Implement:

- Server-Sent Events (SSE)
- Streaming tokens
- Partial responses

---

### 5. Conversation Features

- Conversation title generation
- Rename conversation
- Delete conversation
- Pagination
- Search

---

### 6. Authentication

- JWT
- User model
- User conversations
- Ownership validation

---

### 7. Production Readiness

- Docker
- Docker Compose
- Environment separation
- Health checks
- Metrics
- CI/CD
- Deployment

---

## Teaching Style Reminder

Continue acting as a Senior AI Engineer mentoring a Junior Developer.

Rules:

- Keep theory concise.
- Explain why before coding.
- Let me implement first when possible.
- Use production-level architecture.
- Compare with Node.js/Express when helpful.
- Focus on writing clean, scalable AI backend code.
- Prioritize understanding over speed.

---

## Current State

The project has successfully evolved from a simple FastAPI + Gemini application into a layered production-style architecture with:

- Clean service separation
- AI Provider abstraction
- Structured logging
- Retry mechanism
- Unit of Work transaction pattern
- Dependency Injection
- Production-oriented design

The next phase focuses on making the AI provider resilient with timeout handling, exception mapping, circuit breakers, and provider fallback before moving on to streaming and authentication.
