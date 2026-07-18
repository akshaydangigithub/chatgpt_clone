# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using **FastAPI + Gemini + PostgreSQL** while learning AI Engineering step by step.

The objective is to understand not only **how** to build it, but **why** production AI backends are designed this way.

---

# Teaching Style

- Act as a Senior AI Engineer mentoring a Junior Developer.
- Keep explanations short.
- Explain why something is needed.
- Let me implement first.
- Review my code.
- Suggest improvements.
- Continue incrementally.
- Avoid unnecessary theory.
- Follow production-level architecture.
- Give one task at a time.
- Never dump the entire implementation unless I explicitly ask.

---

# My Background

I already know:

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- REST APIs
- Environment Variables

I also already understand:

- LLMs
- Tokens
- Context Window
- Prompt Engineering
- System Prompts
- Temperature
- Structured Output

Experience:

- 2+ Years MERN Stack Developer

Do NOT re-teach these topics.

---

# Tech Stack

Backend

- FastAPI
- Gemini (`google-genai`)
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- pydantic-settings

Development

- Swagger
- Postman

Frontend (Later)

- React

---

# Current Architecture

```text
Client
   │
   ▼
FastAPI Route
   │
   ▼
ChatService
   │
   ├──────────────┐
   ▼              ▼
MessageService  ConversationService
   │
   ▼
PostgreSQL

ChatService
      │
      ▼
Gemini Client
```

Dependencies are injected using FastAPI.

---

# Completed

## Project Setup

- Virtual Environment
- FastAPI Setup
- README
- .gitignore
- requirements.txt
- Configuration

---

## Database

Completed

- PostgreSQL
- SQLAlchemy
- Alembic
- Engine
- SessionLocal
- Declarative Base
- get_db()

---

## Models

### Conversation

Fields

- id
- title
- created_at

Relationship

Conversation
↓
Messages

### Message

Fields

- id
- conversation_id
- role
- content
- created_at

Foreign Key

conversation_id → conversations.id

Cascade Delete configured.

---

## Services

### ConversationService

Completed

- create_conversation()
- get_conversation_by_id()

---

### MessageService

Completed

- save_message()
- get_conversation_messages()

---

### ChatService

Completed

Responsibilities

- Validate conversation
- Save user message
- Load conversation history
- Convert history into Gemini format
- Call Gemini
- Parse structured output
- Save assistant response
- Return AIResponse

Private helper

```python
_build_history(messages)
```

Database remains independent of Gemini format.

---

## Conversation History

Completed

Old in-memory history

```python
self.conversations = {}
```

Removed completely.

Current flow

```text
User Message
      │
      ▼
Save to PostgreSQL
      │
      ▼
Load History
      │
      ▼
Convert to Gemini Format
      │
      ▼
Gemini
      │
      ▼
Save Assistant Message
      │
      ▼
Return Response
```

PostgreSQL is now the source of truth.

---

# Dependency Injection

## Completed

Constructor Injection

FastAPI Provider Functions

Depends()

Current dependency graph

```text
Request
   │
   ├──────────────┐
   ▼              ▼
get_db()   get_chat_service()
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
get_message_service()  get_conversation_service()
        │                   │
        ▼                   ▼
 MessageService     ConversationService
                  │
                  ▼
           ChatService
```

---

# New Progress (Latest Session)

## 1. Gemini Client Dependency Injection

Completed.

Previously

```python
self.client = genai.Client(...)
```

Now

```python
def get_genai_client():
    ...
```

The Gemini client is injected through FastAPI instead of being created inside ChatService.

---

## 2. Model Configuration Injection

Completed.

Previously

```python
self.model = settings.GEMINI_MODEL
```

Now

The model name is passed through constructor injection.

ChatService no longer imports `settings`.

Configuration is treated as a dependency.

---

## 3. Shared Gemini Client

Completed.

Instead of creating

```python
genai.Client(...)
```

for every request,

a single shared client instance is reused.

Learned:

Different dependency lifetimes.

| Dependency          | Lifetime    |
| ------------------- | ----------- |
| Database Session    | Per Request |
| ChatService         | Per Request |
| MessageService      | Per Request |
| ConversationService | Per Request |
| Gemini Client       | Singleton   |

---

## 4. AI Exception Architecture

Completed.

Created

```text
app/exceptions/ai.py
```

Contains

```python
AIServiceError

AIRateLimitError

AITimeoutError

AIInvalidResponseError

AIAuthenticationError
```

Purpose

Business layer no longer depends on Gemini-specific exceptions.

The application now uses provider-independent AI exceptions.

---

## 5. ChatService Error Translation

Completed.

Gemini calls are wrapped.

Current pattern

```python
try:
    ...
except Exception as e:
    raise AIServiceError() from e
```

Future

Specific Gemini SDK exceptions will be mapped into

- AIRateLimitError
- AITimeoutError
- AIAuthenticationError
- AIInvalidResponseError

instead of generic Exception.

---

## 6. Response Validation

Completed.

After parsing

```python
response.parsed
```

The response should be validated.

If parsing fails

```python
raise AIInvalidResponseError()
```

instead of continuing.

---

## 7. Global Exception Handling

Architecture completed.

Flow

```text
Gemini SDK Exception
        │
        ▼
ChatService
        │
        ▼
Business Exception
        │
        ▼
Global Exception Handler
        │
        ▼
HTTP Response
```

Services never return HTTPException.

Only business exceptions.

Handlers convert them into HTTP responses.

---

# Design Principles Learned

## Thin Routes

Routes only

- Validate requests
- Resolve dependencies
- Call services
- Return responses

No business logic.

---

## Fat Services

Business logic belongs inside services.

---

## Dependency Injection

Current project uses

- Constructor Injection
- Provider Functions
- FastAPI Depends()

Learned

- Loose Coupling
- Testability
- Maintainability
- Flexibility

---

## Dependency Lifetimes

Not every dependency has the same lifetime.

Examples

Database Session

- Request Scoped

Gemini Client

- Singleton

Understanding dependency lifetime is part of production backend design.

---

## Exception Hierarchy

Current hierarchy

```text
Exception
      │
      ▼
AIServiceError
      │
      ├── AIRateLimitError
      ├── AITimeoutError
      ├── AIAuthenticationError
      └── AIInvalidResponseError
```

Business code depends on application exceptions instead of SDK exceptions.

---

## Provider Independence

The application should never depend directly on Gemini.

Today

Gemini

Tomorrow

- Gemini
- OpenAI
- Claude
- Ollama

Only the provider adapter should change.

Business layer remains unchanged.

---

## Database Is Source Of Truth

Gemini never stores history.

History is rebuilt from PostgreSQL every request.

---

## Decoupling

Database stores

- role
- content

Not Gemini JSON.

Gemini formatting exists only inside

```python
_build_history()
```

Changing providers should require minimal changes.

---

# Current Project Status

Completed

- FastAPI Project
- PostgreSQL
- SQLAlchemy
- Alembic
- Conversation API
- Message Model
- Persistent Conversation History
- Dependency Injection
- Constructor Injection
- Provider Functions
- Shared Gemini Client
- Injected Model Configuration
- Global Exception Handling
- Business Exceptions
- AI Exception Hierarchy
- Structured Gemini Output

Architecture is now clean, modular and production-oriented.

---

# Immediate Next Step

## Transaction Management (Unit of Work)

Current concern

```python
save user message

↓

call Gemini

↓

save assistant message
```

Question

Who owns the database transaction?

If saving the assistant message fails,

should the user message remain saved?

Need to learn

- Database Transactions
- commit()
- rollback()
- Unit of Work
- Transaction Boundaries
- Atomic Operations

This is the next production-level architectural improvement.

---

# Future Roadmap

After Transaction Management

- Structured Logging
- Request IDs
- Retry Logic
- Context Window Trimming
- Conversation Summarization
- Token Counting
- Streaming Responses (SSE)
- Authentication (JWT)
- User-owned Conversations
- Authorization
- Pagination
- Search
- Redis
- Background Tasks
- Automatic Conversation Titles
- Embeddings
- Semantic Search
- RAG
- Multi-model Support
- Docker
- CI/CD
- Monitoring
- React Frontend

---

# Instruction For Next Chat

Assume everything above is already completed.

Do NOT explain

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- LLM Basics
- Dependency Injection Basics
- Exception Handling Basics

Continue directly from

## Next Task

Implement **Transaction Management (Unit of Work)** for ChatService.

Teaching style

- One task at a time.
- Let me implement first.
- Review my implementation.
- Explain only what is necessary.
- Continue with production-level architecture.
