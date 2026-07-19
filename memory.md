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
- Repository/Service architecture
- Centralized configuration

---

### Database Models

Completed:

- Conversation
- Message

Implemented relationships and database migrations.

---

### API Layer

Implemented:

- Create Conversation
- Chat Endpoint

Using:

- Request/Response Schemas
- Dependency Injection
- Proper Response Models

---

### Services

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
- Load history
- Call AI Provider
- Save assistant response
- Transaction management
- Rollback on failure

ChatService contains **no Gemini-specific logic**.

---

### AI Provider Architecture

Implemented Provider Pattern.

```
app/
└── providers/
    ├── base.py
    ├── gemini.py
```

Architecture:

```
ChatService
      │
      ▼
AIProvider
      │
      ▼
GeminiProvider
```

Future providers can be added without modifying ChatService.

Examples:

- OpenAI
- Claude
- Groq
- Ollama

---

### GeminiProvider

Implemented:

- Shared Gemini Client
- Structured JSON Output
- `AIResponse` schema
- Logging
- Retry mechanism
- Circuit Breaker integration

Responsibilities:

- Validate circuit state
- Call Gemini
- Parse structured response
- Record success/failure
- Raise domain exceptions

---

### Retry Mechanism

Using:

- Tenacity

Configured:

- Exponential Backoff
- 3 retry attempts
- Retry only on `AIServiceError`
- `before_sleep_log`

Retry belongs to the Provider layer.

---

### Circuit Breaker

Implemented custom Circuit Breaker from scratch.

States:

- CLOSED
- OPEN
- HALF_OPEN

Methods:

- `before_request()`
- `record_success()`
- `record_failure()`
- `_open()`

Features:

- Consecutive failure counting
- Recovery timeout
- Automatic transition:

```
CLOSED
    │
    ▼
OPEN
    │
(after timeout)
    ▼
HALF_OPEN
    │        │
Success     Failure
    │        │
    ▼        ▼
CLOSED     OPEN
```

Integrated inside `GeminiProvider`.

Current request flow:

```
ChatService
      │
      ▼
GeminiProvider
      │
      ▼
CircuitBreaker.before_request()
      │
      ▼
Gemini API
      │
      ├── Success
      │       │
      │       ▼
      │ record_success()
      │
      └── Failure
              │
              ▼
      record_failure()
```

Learned:

- Why Retry alone is insufficient
- Retry vs Circuit Breaker
- Fail Fast principle
- Recovery testing using HALF_OPEN
- Dependency Injection for shared breaker instance
- Why Circuit Breaker belongs in Provider layer

---

### Logging

Implemented production-style logging.

Features:

- Rich logging
- Request ID using ContextVars
- Logging Filter
- Custom Rich Handler
- Automatic Request ID injection
- Uvicorn integration
- Tracebacks with locals
- Clean console output

Current logging includes:

- Request ID
- Logger
- Timestamp
- Level
- Message

Future improvement:

- Log Circuit Breaker state transitions
- JSON logging for production

---

### Request Middleware

Implemented:

- UUID Request ID generation
- ContextVar integration
- Response header (`X-Request-ID`)
- Request cleanup

---

### Error Handling

Current custom exceptions:

- AIServiceError
- AIRateLimitError
- AIAuthenticationError
- AIInvalidResponseError
- AITimeoutError
- AICircuitOpenError
- ConversationNotFoundError

Rollback handling implemented inside ChatService.

---

### Transaction Pattern

Current design:

- Routes own commits
- Services use `flush()` and `refresh()`
- ChatService executes one transaction for the complete chat workflow

Following Unit of Work architecture.

---

# Architecture Principles Learned

## Provider Pattern

Business logic never imports Gemini SDK.

```
ChatService
      │
      ▼
AIProvider
      │
      ▼
GeminiProvider
```

---

## Dependency Injection

Injected:

- Database Session
- Gemini Client
- Circuit Breaker
- AI Provider
- Services

---

## Separation of Responsibilities

ConversationService

- Conversation CRUD

MessageService

- Message persistence

ChatService

- Business orchestration

GeminiProvider

- AI communication

CircuitBreaker

- Provider resilience

---

## Production Concepts Learned

- Layered Architecture
- Dependency Injection
- Provider Pattern
- Retry Pattern
- Circuit Breaker Pattern
- Structured Logging
- Request Correlation
- Unit of Work
- Fail Fast
- Exponential Backoff

---

# Next Learning Steps

Continue in this order.

## 1. Exception Mapping ⭐ (Current Next Topic)

Current implementation:

```
Exception
      │
      ▼
AIServiceError
```

Need to improve to:

```
Gemini SDK Exception
        │
        ▼
Domain Exception

Timeout
    ▼
AITimeoutError

429
    ▼
AIRateLimitError

401
    ▼
AIAuthenticationError

Invalid Response
    ▼
AIInvalidResponseError

Unknown
    ▼
AIServiceError
```

Learn:

- Domain exceptions
- Exception mapping
- Retry decisions
- Circuit Breaker interaction
- Better provider resilience

---

## 2. Provider Fallback

Example:

```
Gemini
    │
    ▼
OpenAI
    │
    ▼
Claude
```

---

## 3. Streaming Responses

Implement:

- SSE
- Token streaming
- Partial responses

---

## 4. Conversation Features

- Auto title generation
- Rename
- Delete
- Pagination
- Search

---

## 5. Authentication

Implement:

- JWT
- User model
- User conversations
- Ownership validation

---

## 6. Production Readiness

- Docker
- Docker Compose
- Environment separation
- Health Checks
- Metrics
- CI/CD
- Deployment

---

# Teaching Style Reminder

Continue acting as a Senior AI Engineer mentoring a Junior Developer.

Rules:

- Keep theory concise.
- Explain why before coding.
- Let me implement first whenever possible.
- Follow production architecture.
- Compare with Node.js/Express when useful.
- Focus on clean, scalable AI backend engineering.
- Prioritize understanding over speed.

---

# Current State

The project has evolved into a production-style AI backend featuring:

- Clean Layered Architecture
- Service Separation
- Provider Pattern
- Dependency Injection
- Structured Logging
- Retry Mechanism
- Circuit Breaker
- Unit of Work
- Production-oriented design

The next milestone is **Exception Mapping**, followed by Provider Fallback, Streaming Responses, Authentication, and Production Deployment.
