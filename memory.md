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

## Backend

- FastAPI
- Gemini (`google-genai`)
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- pydantic-settings

## Development

- Swagger
- Postman

## Frontend (Later)

- React

---

# Current Architecture

```text
                    Client
                       │
                       ▼
              Request ID Middleware
                       │
                       ▼
                 FastAPI Routes
                       │
                       ▼
                  ChatService
          ┌──────────┴──────────┐
          ▼                     ▼
 MessageService        ConversationService
          │                     │
          └──────────┬──────────┘
                     ▼
               PostgreSQL

                     │
                     ▼
              AI Provider Layer
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

### MessageService

Completed

- save_message()
- get_conversation_messages()

### ChatService

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

# Conversation History

Old implementation

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

PostgreSQL is the source of truth.

---

# Dependency Injection

Completed

- Constructor Injection
- Provider Functions
- FastAPI Depends()

Current dependency graph

```text
Request
   │
   ├──────────────┐
   ▼              ▼
get_db()   get_chat_service()
                 │
        ┌────────┴────────┐
        ▼                 ▼
MessageService   ConversationService
        │                 │
        └────────┬────────┘
                 ▼
            ChatService
```

---

# Gemini Dependency Injection

Completed

- Shared Gemini Client (Singleton)
- Injected Model Name
- ChatService no longer imports settings
- Gemini Client created through provider function

Dependency lifetimes

| Dependency          | Lifetime    |
| ------------------- | ----------- |
| Database Session    | Per Request |
| ChatService         | Per Request |
| MessageService      | Per Request |
| ConversationService | Per Request |
| Gemini Client       | Singleton   |

---

# AI Exception Architecture

Completed

Created

```
app/exceptions/ai.py
```

Contains

- AIServiceError
- AIRateLimitError
- AITimeoutError
- AIAuthenticationError
- AIInvalidResponseError

Business layer depends only on application exceptions.

No Gemini SDK exceptions leak outside ChatService.

---

# Global Exception Handling

Architecture

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

Services never raise HTTPException.

---

# Transaction Management (NEW)

## Completed

Learned:

- ACID
- Atomicity
- Transaction Boundaries
- Unit of Work
- commit()
- rollback()
- flush()
- autoflush

### Major Refactor

Previously

```text
MessageService
    commit()

ConversationService
    commit()
```

Now

```text
MessageService
    add()

ConversationService
    add()

ChatService
    commit()
```

Services no longer own database transactions.

ChatService is now the Unit of Work.

---

## Current Transaction Flow

```text
Start Transaction

↓

Save User Message

↓

Load Conversation

↓

Call Gemini

↓

Validate Response

↓

Save Assistant Message

↓

Commit

↓

Return Response
```

If anything fails

```text
Rollback

↓

Re-raise Exception
```

---

## Important Concepts Learned

### add()

Marks an object as pending.

Does NOT write to the database.

---

### flush()

Executes SQL statements.

INSERT is sent to PostgreSQL.

Changes are still inside the transaction.

Rollback removes them.

---

### commit()

Makes the transaction permanent.

Visible to every other database session.

Rollback is no longer possible.

---

### rollback()

Returns the transaction to its previous state.

Must always be called if a transaction fails.

---

### Autoflush

Before executing queries SQLAlchemy automatically flushes pending changes.

Therefore

```python
db.add(user)

db.query(User).all()
```

returns the newly added user even before commit.

---

# Production Trade-offs Learned

Compared

## One Long Transaction

Pros

- Atomic
- Simple

Cons

- Long-running transactions
- Holds database resources

---

## Two Transactions

Pros

- Better scalability
- Short transactions

Cons

- User message may exist without assistant reply

---

Learned about

- Eventual Consistency
- Message Status Pattern
- Why ChatGPT-like systems usually do not keep transactions open during LLM inference.

---

# Logging

Completed

Created

```
app/core/logging.py
```

Using Python logging instead of print().

Current logs include

- Timestamp
- Log Level
- Logger Name
- Message

Using

```python
logger = logging.getLogger(__name__)
```

instead of print().

---

# Request ID Middleware

Completed

Created

```
app/middleware/request_id.py
```

Middleware

- Generates UUID
- Stores request.state.request_id
- Calls next middleware / route
- Adds

```
X-Request-ID
```

response header.

Middleware registered inside

```
main.py
```

using

```python
app.middleware("http")(request_id_middleware)
```

---

# Design Principles Learned

## Thin Routes

Routes only

- Validate Request
- Resolve Dependencies
- Call Services
- Return Response

No business logic.

---

## Fat Services

Business logic belongs inside services.

---

## Dependency Injection

Using

- Constructor Injection
- Provider Functions
- FastAPI Depends()

---

## Unit of Work

Only one component owns the database transaction.

Current owner

```
ChatService
```

---

## Provider Independence

Business layer should never depend directly on Gemini.

Future providers

- OpenAI
- Claude
- Ollama

should require minimal changes.

---

## Database Is Source Of Truth

Conversation history is rebuilt from PostgreSQL every request.

---

## Decoupling

Database stores

- role
- content

not Gemini JSON.

Gemini formatting exists only inside

```python
_build_history()
```

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
- AI Exception Hierarchy
- Structured Gemini Output
- Unit of Work
- Transaction Management
- commit / rollback ownership
- Logging
- Request ID Middleware

Architecture is now clean, modular and production-oriented.

---

# Immediate Next Step

## Structured Logging

Implement production-grade logging.

Topics

- Log Formatter
- JSON Logs
- Request Context
- contextvars
- Automatic Request ID Injection
- Structured Log Records

Goal

Instead of

```
INFO Calling Gemini
```

produce

```json
{
  "timestamp": "...",
  "level": "INFO",
  "request_id": "...",
  "conversation_id": "...",
  "service": "ChatService",
  "message": "Calling Gemini"
}
```

without manually passing request_id everywhere.

---

# Future Roadmap

After Structured Logging

- contextvars
- Request Timing Middleware
- Automatic Exception Logging
- Retry Logic
- Exponential Backoff
- Timeout Handling
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

Do NOT explain again

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Dependency Injection basics
- Transactions basics
- Logging basics
- LLM basics

Continue directly with

## Next Task

Implement **Production Structured Logging using contextvars**.

Teaching Style

- One task at a time.
- Let me implement first.
- Review my code.
- Explain only what is necessary.
- Focus on production architecture.
- Continue as a Senior AI Engineer mentoring a Junior Developer.
