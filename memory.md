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

Implemented the Provider Pattern.

```
app/
└── providers/
    ├── base.py
    ├── gemini.py
    └── fallback.py
```

Architecture:

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

Business logic depends only on the `AIProvider` interface.

Future providers can be added without modifying `ChatService`.

Examples:

- OpenAI
- Claude
- Groq
- Ollama
- Azure OpenAI

---

### GeminiProvider

Implemented:

- Shared Gemini Client
- Structured JSON Output
- `AIResponse` schema
- Logging
- Retry mechanism
- Circuit Breaker integration
- Exception Mapping

Responsibilities:

- Validate Circuit Breaker state
- Call Gemini
- Parse structured response
- Map SDK exceptions into domain exceptions
- Record success/failure
- Raise domain exceptions

---

### FallbackProvider

Implemented a production-style fallback provider.

Responsibilities:

- Accept multiple AI providers
- Try providers in priority order
- Return immediately on first success
- Continue to next provider on failure
- Collect provider failures
- Raise a single error if all providers fail
- Log provider failures

Current implementation:

```
ChatService
      │
      ▼
FallbackProvider
      │
      ▼
GeminiProvider
```

Future configuration:

```
FallbackProvider(
    providers=[
        gemini_provider,
        openai_provider,
        claude_provider,
    ]
)
```

Learned:

- Provider Fallback Pattern
- Runtime Provider Composition
- Composition Root
- Open/Closed Principle
- Failover Strategy

---

### Retry Mechanism

Using:

- Tenacity

Configured:

- Exponential Backoff
- 3 retry attempts
- Retry only for recoverable exceptions
- `before_sleep_log`

Current retry policy:

Retry:

- Timeout
- Rate Limit (future)

Do NOT Retry:

- Authentication
- Invalid Response
- Unknown Errors

Retry belongs to the Provider layer.

---

### Exception Mapping

Implemented provider-level exception mapping.

Purpose:

- Hide Gemini SDK exceptions
- Expose only domain exceptions

Current mappings:

- ValidationError → AIInvalidResponseError
- TimeoutError → AITimeoutError
- Unknown Exception → AIServiceError

Architecture:

```
Gemini SDK Exception
        │
        ▼
GeminiProvider
        │
        ▼
Domain Exception
        │
        ▼
ChatService
```

Learned:

- Domain Exceptions
- Exception Mapping
- Exception Classification
- Retryable vs Non-Retryable Exceptions

---

### Circuit Breaker

Implemented custom Circuit Breaker.

States:

- CLOSED
- OPEN
- HALF_OPEN

Methods:

- before_request()
- record_success()
- record_failure()
- \_open()

Features:

- Consecutive failure counting
- Recovery timeout
- Automatic state transition

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
Success    Failure
    │        │
    ▼        ▼
CLOSED    OPEN
```

Integrated inside `GeminiProvider`.

Current flow:

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

- Retry vs Circuit Breaker
- Fail Fast
- Recovery Testing
- HALF_OPEN state
- Shared dependency injection

---

### Logging

Implemented production logging.

Features:

- Rich Logging
- Request ID
- ContextVars
- Logging Filter
- Custom Rich Handler
- Tracebacks
- Uvicorn integration

Current logs include:

- Request ID
- Logger
- Timestamp
- Level
- Message

Future:

- JSON Logging
- Structured Provider Metrics

---

### Request Middleware

Implemented:

- UUID Request ID
- ContextVar integration
- Response Header
- Cleanup

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
- Services use flush()/refresh()
- ChatService executes one transaction

Following Unit of Work architecture.

---

### Dependency Injection

Current dependency graph:

```
FastAPI Route
      │
      ▼
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

Current injected dependencies:

- Database Session
- Gemini Client (Singleton)
- Circuit Breaker (Singleton)
- GeminiProvider
- FallbackProvider
- Services

Provider composition happens only inside the Dependency Injection layer.

---

# Architecture Principles Learned

## Provider Pattern

Business layer never imports Gemini SDK.

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

- Message Persistence

ChatService

- Business Orchestration

GeminiProvider

- AI Communication

FallbackProvider

- Provider Selection
- Failover

CircuitBreaker

- Provider Resilience

---

# Production Concepts Learned

- Layered Architecture
- Dependency Injection
- Provider Pattern
- Provider Fallback
- Retry Pattern
- Circuit Breaker Pattern
- Structured Logging
- Request Correlation
- Unit of Work
- Fail Fast
- Exponential Backoff
- Exception Mapping
- Exception Classification
- Failover Strategy
- Composition Root

---

# Next Learning Steps

Continue in this order.

## 1. Streaming Responses (Current Next Topic) ⭐

Implement:

- Server-Sent Events (SSE)
- StreamingResponse
- Token Streaming
- Provider Streaming API

Architecture:

```
ChatService
      │
      ▼
AIProvider.stream_response()
      │
      ▼
GeminiProvider
      │
      ▼
Gemini Streaming API
```

Learn:

- Generators
- Yield
- StreamingResponse
- SSE
- Token Streaming

---

## 2. Conversation Features

Implement:

- Auto Title Generation
- Rename Conversation
- Delete Conversation
- Pagination
- Search

---

## 3. Authentication

Implement:

- JWT
- User Model
- User Conversations
- Ownership Validation

---

## 4. Production Readiness

Implement:

- Docker
- Docker Compose
- Environment Separation
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
- Let me implement first.
- Follow production architecture.
- Compare with Node.js/Express when useful.
- Focus on clean, scalable AI backend engineering.
- Prioritize understanding over speed.

---

# Current State

The project has evolved into a production-style AI backend featuring:

- Clean Layered Architecture
- Repository/Service Pattern
- Dependency Injection
- Provider Pattern
- Provider Fallback
- Retry Mechanism
- Circuit Breaker
- Exception Mapping
- Exception Classification
- Structured Logging
- Request Correlation
- Unit of Work
- Production-ready Dependency Composition

Current architecture:

```
FastAPI
    │
    ▼
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
    │
    ▼
Gemini API
```

The architecture is now ready to support multiple AI providers without changing the business layer.

The next milestone is **Streaming Responses (SSE)**, followed by Conversation Features, Authentication, and Production Deployment.
