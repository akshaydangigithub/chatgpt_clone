# ChatGPT Clone Backend (Learning Mode)

# Goal

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

# Current Project Structure

```text
chatgpt_clone/

├── app
│   ├── api/
│   │   └── routes/
│   │       ├── chat.py
│   │       └── conversation.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   │
│   ├── models/
│   │   ├── conversation.py
│   │   └── message.py
│   │
│   ├── schemas/
│   │
│   ├── services/
│   │   ├── chat_service.py
│   │   ├── conversation_service.py
│   │   └── message_service.py
│   │
│   ├── exceptions/
│   │   ├── conversation.py
│   │   └── handlers.py
│   │
│   ├── dependencies.py
│   │
│   └── main.py
│
├── alembic/
├── README.md
├── requirements.txt
└── .gitignore
```

---

# Completed

## Project Setup

Completed

- Virtual Environment
- FastAPI Setup
- Configuration
- README
- .gitignore
- requirements.txt

---

## Configuration

Completed

- BaseSettings
- SettingsConfigDict
- GEMINI_API_KEY
- GEMINI_MODEL
- DATABASE_URL

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

Completed

Fields

- id
- title
- created_at

Relationship

Conversation
↓
Messages

---

### Message

Completed

Fields

- id
- conversation_id
- role
- content
- created_at

Foreign Key

conversation_id -> conversations.id

Cascade Delete Configured

---

## Conversation API

Completed

POST /conversations

ConversationService

- create_conversation()

ConversationResponse

- id
- title
- created_at

---

## MessageService

Completed

Methods

- save_message()
- get_conversation_messages()

Responsibilities

- Save Messages
- Load Conversation History

---

## Chat API

Completed

POST /chat

Gemini Structured Output

Schema

```python
class AIResponse(BaseModel):
    answer: str
    category: str
    confidence: float
```

Gemini Config

```python
config=types.GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=AIResponse,
)
```

---

## Persistent Conversation History

Completed

Old

```python
self.conversations = {}
```

Removed.

Current Flow

User Message

↓

Save To PostgreSQL

↓

Load Conversation Messages

↓

Build Gemini History

↓

Gemini

↓

Save Assistant Message

↓

Return AIResponse

Conversation history is now rebuilt from PostgreSQL every request.

No in-memory history exists anymore.

---

## ChatService

Completed

Private Helper

```python
_build_history(messages)
```

Purpose

Converts

```text
role
content
```

into Gemini format

```python
[
    {
        "role": "...",
        "parts": [
            {
                "text": "..."
            }
        ]
    }
]
```

Database remains Gemini-independent.

---

# New Progress (Current Session)

## 1. Conversation Validation

Completed

Added

```python
ConversationService.get_conversation_by_id(
    db,
    conversation_id,
)
```

Flow

```text
Receive Request
        │
        ▼
Validate Conversation
        │
 ┌──────┴──────┐
 │             │
 ▼             ▼
Exists?     Not Found
 │             │
 ▼             ▼
Continue   Raise Exception
```

Purpose

Avoid foreign key errors before saving messages.

---

## 2. Custom Exceptions

Completed

Created

```text
app/exceptions/conversation.py
```

Implemented

```python
class ConversationNotFoundError(Exception):
    ...
```

Purpose

Business layer no longer raises HTTPException.

Instead

```python
raise ConversationNotFoundError(conversation_id)
```

---

## 3. Global Exception Handlers

Completed

Created

```text
app/exceptions/handlers.py
```

Registered

- ConversationNotFoundError → HTTP 404
- Exception → HTTP 500

Current Pattern

```text
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

Learned

- FastAPI automatically invokes handlers registered with

```python
@app.exception_handler(...)
```

- We never call handlers manually.

---

## 4. Removed HTTPException From Services

Completed

Old

```python
try:
    ...
except Exception:
    raise HTTPException(...)
```

Removed.

Current

Services simply raise business exceptions.

FastAPI handles HTTP conversion.

This keeps the service layer independent of the web framework.

---

## 5. Dependency Injection (Manual)

Learned

Old

```python
self.message_service = MessageService()
```

New

```python
class ChatService:
    def __init__(
        self,
        message_service,
        conversation_service,
    ):
        ...
```

Dependencies are injected instead of being created internally.

Learned Constructor Injection.

---

## 6. FastAPI Dependency Injection

Completed

Created

```text
app/dependencies.py
```

Implemented

```python
get_message_service()

get_conversation_service()

get_chat_service()
```

Current Pattern

```python
chat_service: ChatService = Depends(get_chat_service)
```

Learned

Provider Functions

Dependency Graph

Depends()

FastAPI automatically resolves nested dependencies.

---

# Current Dependency Graph

```text
Request
   │
   ├──────────────┐
   ▼              ▼
get_db()   get_chat_service()
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
get_message_service()   get_conversation_service()
      │                       │
      ▼                       ▼
 MessageService      ConversationService
                  │
                  ▼
             ChatService
```

---

# Important Design Principles Learned

## Thin Routes

Routes should only

- Validate Request
- Resolve Dependencies
- Call Service
- Return Response

No business logic.

---

## Fat Services

Business logic belongs inside services.

---

## Single Responsibility Principle

ConversationService

- Conversation operations only

MessageService

- Message operations only

ChatService

- Coordinates
  - Database
  - Gemini
  - MessageService
  - ConversationService

---

## Database Is Source Of Truth

Gemini never stores conversation history.

History is rebuilt every request from PostgreSQL.

---

## Decoupling

Database stores

- role
- content

NOT Gemini JSON.

Gemini-specific formatting exists only inside

```python
_build_history()
```

This allows changing AI providers later.

---

## Dependency Injection

Current

- Constructor Injection
- Provider Functions
- FastAPI Depends()

Understood why dependency injection improves

- Testability
- Flexibility
- Loose Coupling
- Maintainability

---

## Exception Handling

Current Pattern

Business Layer

↓

Custom Exception

↓

Global Exception Handler

↓

HTTP Response

No HTTPException inside services.

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
Gemini API
```

Dependencies are injected using FastAPI.

---

# Immediate Next Step

Inject the Gemini client using Dependency Injection.

Current

```python
self.client = genai.Client(...)
```

Problem

ChatService still creates one dependency itself.

Next Refactor

Create provider

```python
def get_genai_client():
    return genai.Client(
        api_key=settings.GEMINI_API_KEY,
    )
```

Update ChatService

```python
class ChatService:
    def __init__(
        self,
        client,
        message_service,
        conversation_service,
    ):
        self.client = client
```

Update

```python
get_chat_service()
```

to inject

```python
client: genai.Client = Depends(get_genai_client)
```

Goal

ChatService should create **zero dependencies** itself.

Everything should be injected.

---

# Future Roadmap

After DI

- Logging
- Proper Transaction Management
- Unit Testing
- Repository Pattern (if required)
- Context Window Trimming
- Conversation Summarization
- Streaming Responses
- Authentication
- User-owned Conversations
- Rate Limiting
- Pagination
- Redis Caching
- Background Tasks
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

Inject the Gemini Client using FastAPI Dependency Injection.

Teaching Style

- One task at a time.
- Let me code first.
- Review my implementation.
- Explain only what is necessary.
- Focus on production-level architecture.
- Continue incrementally.
