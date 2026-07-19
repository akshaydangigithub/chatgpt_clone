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
- Repository / Service architecture
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
- Streaming Chat Endpoint

Using:

- Request/Response Schemas
- Dependency Injection
- Proper Response Models
- StreamingResponse

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

Implemented:

- Validate conversation
- Save user message
- Load conversation history
- Build provider history
- Call AI Provider
- Save assistant response
- Transaction management
- Rollback on failure
- Streaming response orchestration

Streaming flow:

```
Validate Conversation
        │
        ▼
Save User Message
        │
        ▼
Load History
        │
        ▼
Provider.stream_response()
        │
        ▼
Yield Chunks
        │
        ▼
Build Full Response
        │
        ▼
Save Assistant Message
        │
        ▼
Commit Transaction
```

ChatService contains **no Gemini-specific logic**.

---

### AI Provider Architecture

Implemented Provider Pattern.

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

Business layer depends only on `AIProvider`.

Future providers:

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
- AIResponse schema
- Retry
- Circuit Breaker
- Exception Mapping
- Streaming Support

Supports:

- generate_response()
- stream_response()

Responsibilities:

- Call Gemini
- Stream text chunks
- Exception Mapping
- Circuit Breaker
- Retry (non-streaming)
- Yield plain text chunks

---

### Streaming Responses ✅

Implemented production-style streaming.

Implemented:

- Provider streaming
- ChatService streaming
- Streaming FastAPI endpoint
- StreamingResponse
- Iterator-based provider interface
- Incremental chunk streaming
- Final response persistence

Architecture:

```
FastAPI Route
      │
      ▼
StreamingResponse
      │
      ▼
ChatService.stream_response()
      │
      ▼
AIProvider.stream_response()
      │
      ▼
FallbackProvider
      │
      ▼
GeminiProvider
      │
      ▼
Gemini Streaming API
```

Current behavior:

- Validate conversation
- Save user message
- Load history
- Stream AI chunks
- Yield chunks immediately
- Build final response
- Save complete assistant message
- Commit transaction

Learned:

- Python Generators
- yield
- Iterator
- StreamingResponse
- HTTP Streaming
- AI Token Streaming
- Streaming Architecture
- Generator lifecycle
- Lazy execution

---

### Retry Mechanism

Using:

- Tenacity

Configured:

- Exponential Backoff
- 3 retry attempts
- Retry only recoverable errors

Retry:

- Timeout
- Rate Limit

No Retry:

- Authentication
- Invalid Response
- Unknown Errors

Retry currently applies only to non-streaming responses.

---

### Exception Mapping

Implemented provider-level exception mapping.

Mappings:

- ValidationError → AIInvalidResponseError
- TimeoutError → AITimeoutError
- Unknown Exception → AIServiceError

---

### Circuit Breaker

Implemented:

States:

- CLOSED
- OPEN
- HALF_OPEN

Integrated inside GeminiProvider.

---

### Logging

Implemented:

- Rich Logging
- Request ID
- ContextVars
- Logging Filter
- Custom Handler
- Tracebacks
- Uvicorn Integration

---

### Middleware

Implemented:

- Request ID
- ContextVar
- Response Header
- Cleanup

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

Rollback handled inside ChatService.

---

### Transaction Pattern

Current Design:

Routes

↓

ChatService

↓

Commit / Rollback

Streaming transaction handled inside ChatService because generator execution continues after route returns.

---

### Dependency Injection

Dependency graph:

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

Injected:

- Database Session
- Gemini Client
- Circuit Breaker
- GeminiProvider
- FallbackProvider
- Services

---

# Architecture Principles Learned

- Layered Architecture
- Provider Pattern
- Provider Fallback
- Dependency Injection
- Service Layer
- Unit of Work
- Exception Mapping
- Retry Pattern
- Circuit Breaker
- Streaming Architecture
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
- Provider Pattern
- Dependency Injection
- Repository Pattern
- Service Layer
- StreamingResponse
- Python Generators
- Iterator Pattern
- Token Streaming

---

# Next Learning Steps

Continue in this order.

## 1. Server-Sent Events (SSE) ⭐

Current streaming works.

Next improve it by implementing proper SSE.

Implement:

- text/event-stream
- SSE Event Format
- data: <chunk>\n\n
- End Events
- Error Events
- Heartbeat Events
- SSE Formatter

Learn:

- SSE Protocol
- Browser EventSource
- fetch() Streaming
- Event framing

---

## 2. Conversation Features

Implement:

- Auto Title Generation
- Rename Conversation
- Delete Conversation
- Pagination
- Search
- Conversation Listing

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
- Prioritize understanding over speed.

---

# Current State

The backend now supports:

- Clean Layered Architecture
- Repository Pattern
- Service Layer
- Dependency Injection
- Provider Pattern
- Provider Fallback
- Retry
- Circuit Breaker
- Exception Mapping
- Structured Logging
- Request Correlation
- Streaming Responses
- Production-style Transaction Handling

Current Architecture:

```
FastAPI
    │
    ▼
StreamingResponse
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

The project is now capable of returning both normal and streamed AI responses while keeping the business layer completely independent of the AI provider.

The next milestone is implementing **proper Server-Sent Events (SSE)**, followed by Conversation Features, Authentication, and Production Deployment.
