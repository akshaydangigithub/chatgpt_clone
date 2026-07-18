# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using **FastAPI + Gemini + PostgreSQL** while learning AI Engineering step by step.

The objective is to understand not only _how_ to build it, but _why_ production AI backends are designed this way.

---

# Teaching Style

- Act as a Senior AI Engineer mentoring a Junior Developer.
- Keep explanations short.
- Explain why something is needed.
- Let me implement first.
- Review my code.
- Suggest improvements.
- Then continue.
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

- 2+ years MERN Stack Developer

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

- Postman
- Swagger

Frontend (later)

- React

---

# Current Project Structure

```text
chatgpt_clone/
│
├── app/
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
│   │   ├── chat.py
│   │   └── conversation.py
│   │
│   ├── services/
│   │   ├── chat_service.py
│   │   ├── conversation_service.py
│   │   └── message_service.py
│   │
│   └── main.py
│
├── alembic/
├── requirements.txt
├── README.md
└── .gitignore
```

---

# Completed

## 1. Project Setup

Completed

- Virtual Environment
- FastAPI project structure
- Environment configuration
- README
- requirements.txt
- .gitignore

---

# 2. Configuration

Completed

- BaseSettings
- SettingsConfigDict
- GEMINI_API_KEY
- GEMINI_MODEL
- DATABASE_URL

---

# 3. Basic Chat API

Completed

- ChatRequest
- AIResponse
- POST /chat
- Gemini integration
- Swagger testing

---

# 4. Structured Output

Implemented Gemini Structured Output.

Schema:

```python
class AIResponse(BaseModel):
    answer: str
    category: str
    confidence: float
```

Gemini configuration:

```python
config=types.GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=AIResponse,
)
```

Learned

- response.text
- response.parsed

Only `ai_response.answer` is stored inside conversation history.

---

# 5. Initial In-Memory Conversation History

Initially implemented

```python
self.conversations = {}
```

Conversation history was stored in RAM.

Each conversation was isolated using `conversation_id`.

This implementation worked but had limitations.

Problems

- Lost after server restart
- Not scalable
- Multiple workers had different histories
- Not production ready

---

# 6. PostgreSQL Integration

Completed

- Database created
- SQLAlchemy configured
- Alembic configured
- Database dependency (`get_db`)
- Engine
- SessionLocal
- Declarative Base

---

# 7. Database Models

## Conversation Model

Completed

Fields

- id
- title
- created_at

Relationship

```text
Conversation
      │
      ▼
Messages
```

---

## Message Model

Completed

Fields

- id
- conversation_id
- role
- content
- created_at

Foreign Key

```
conversation_id -> conversations.id
```

Cascade delete configured.

---

# 8. Conversation API

Completed

Created

```
POST /conversations
```

Implemented

ConversationResponse

```python
id
title
created_at
```

ConversationService

```python
create_conversation(db)
```

Router

- Uses Depends(get_db)
- Returns ConversationResponse
- Returns HTTP 201

---

# 9. Service Layer

Current services

```
ConversationService
MessageService
ChatService
```

---

## ConversationService

Current responsibility

- Create Conversation

Current implementation

```python
create_conversation(db)
```

---

## MessageService

Created to follow Single Responsibility Principle.

Current methods

```python
save_message(...)
```

and

```python
get_conversation_messages(...)
```

save_message

- Creates Message
- Adds to session
- Commit
- Refresh
- Returns Message

get_conversation_messages

- Filters by conversation_id
- Orders by created_at ASC
- Returns list[Message]

---

# 10. ChatService Refactor

The biggest architectural change completed.

Old architecture

```text
Chat
   │
   ▼
self.conversations
   │
   ▼
Gemini
```

New architecture

```text
Chat
   │
   ▼
PostgreSQL
   │
   ▼
Gemini
```

Removed

```python
self.conversations = {}
```

Injected

```python
MessageService()
```

Updated

```python
generate_response(
    db,
    request,
)
```

---

# 11. Building Gemini History

Created private helper

```python
_build_history(
    messages,
)
```

Input

```python
list[Message]
```

Output

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

Purpose

Keep Gemini-specific formatting inside ChatService.

Database remains independent of Gemini.

---

# 12. Persistent Chat Flow

Current flow

```text
POST /chat
        │
        ▼
Save User Message
        │
        ▼
Load Messages
        │
        ▼
Build Gemini History
        │
        ▼
Gemini API
        │
        ▼
Receive AIResponse
        │
        ▼
Save Assistant Message
        │
        ▼
Return AIResponse
```

Current ChatService flow

```python
save_message(user)

↓

get_conversation_messages()

↓

_build_history()

↓

Gemini.generate_content()

↓

response.parsed

↓

save_message(model)

↓

return AIResponse
```

Conversation history is now completely reconstructed from PostgreSQL.

Server restart no longer loses history.

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
    ├───────────────┐
    ▼               ▼
MessageService   Gemini API
    │
    ▼
PostgreSQL
```

No in-memory history exists anymore.

---

# Important Design Decisions Learned

## Thin Routes

Routes should

- Validate request
- Call service
- Return response

No business logic.

---

## Fat Services

Business logic belongs inside services.

---

## Single Responsibility Principle

ConversationService

Only conversation operations.

MessageService

Only message operations.

ChatService

Coordinates

- Database
- MessageService
- Gemini

---

## Database is Source of Truth

Gemini never stores history.

History is reconstructed every request from PostgreSQL.

---

## Decoupling

Database stores

```text
role
content
```

NOT Gemini JSON.

Gemini format is generated only inside

```python
_build_history()
```

This allows switching AI providers later.

---

# Known Issues (To Improve Later)

Current ChatService still catches

```python
except Exception:
    raise HTTPException(...)
```

Eventually replace with

- Custom Exceptions
- Global Exception Handlers

---

Current MessageService commits every operation.

Eventually move transaction management to ChatService.

Current flow

```
commit
↓

Gemini

↓

commit
```

Future

```
Save User
↓

Gemini
↓

Save Assistant
↓

Single Commit
```

---

# Immediate Next Step

Conversation validation.

Before saving messages, ChatService should verify the conversation exists.

Current problem

If a random UUID is sent

```
POST /chat
```

Database raises a foreign key error.

Desired flow

```text
Receive Request
        │
        ▼
Find Conversation
        │
 ┌──────┴──────┐
 │             │
Exists?      Not Found
 │             │
 ▼             ▼
Continue     Return 404
```

Implement

```python
ConversationService.get_conversation_by_id(
    db,
    conversation_id,
)
```

Then inside ChatService

```python
conversation = conversation_service.get_conversation_by_id(...)

if not conversation:
    raise ConversationNotFoundError
```

Initially it may raise HTTPException(404).

Later replace with custom exceptions.

---

# Future Roadmap

## Conversation APIs

- GET /conversations
- GET /conversations/{id}
- DELETE /conversations/{id}
- PATCH conversation title

---

## Error Handling

- Remove HTTPException from services
- Custom Exceptions
- Global Exception Handlers
- Database rollback
- Gemini error handling

---

## Production Improvements

- Logging
- Proper transaction management
- Dependency Injection
- Rate Limiting
- Pagination
- Context window trimming
- Conversation summarization
- Streaming responses
- Authentication
- Associate conversations with users
- User-owned conversations
- React frontend

---

# Instruction For Next Chat

Assume everything above is already completed.

Do NOT

- Restart project
- Explain Python
- Explain FastAPI
- Explain SQLAlchemy
- Explain PostgreSQL
- Explain LLM basics
- Explain Structured Output basics

Continue directly from

## Next Task

Implement conversation validation before chat execution.

Order of work

1. Add `get_conversation_by_id()` to `ConversationService`.
2. Validate `conversation_id` inside `ChatService`.
3. Return `404` when conversation doesn't exist.
4. Refactor to custom exceptions.
5. Add global exception handlers.

Teaching style

- Short explanations.
- One task at a time.
- Let me code first.
- Review my implementation.
- Suggest improvements.
- Continue incrementally with production best practices.
