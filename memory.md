# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using FastAPI + Gemini + PostgreSQL while learning AI Engineering step by step.

---

# Teaching Style

- Act as a Senior AI Engineer mentoring a Junior Developer.
- Explain concepts briefly.
- Explain why they are needed.
- Let me implement first.
- Review my code.
- Suggest improvements.
- Then move to the next step.
- Avoid unnecessary theory.
- Avoid explaining basic Python, FastAPI, PostgreSQL, or SQLAlchemy concepts unless needed.
- Follow a production mindset while teaching incrementally.

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
- Structured Output basics

Experience: 2+ years as a MERN Stack Developer.

---

# Tech Stack

Backend:

- FastAPI
- Gemini API (`google-genai`)
- PostgreSQL
- SQLAlchemy 2.x ORM
- Alembic
- Pydantic
- pydantic-settings
- Uvicorn

Development:

- Postman
- Swagger

Frontend later:

- React

---

# Current Project Structure

Current structure conceptually includes:

```text
chatgpt_clone/
│
├── app/
│   ├── api/
│   │   └── routes/
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
│   │   └── chat.py
│   │
│   ├── services/
│   │   └── chat_service.py
│   │
│   └── main.py
│
├── alembic/
├── .env
├── alembic.ini
├── requirements.txt
├── .gitignore
└── README.md
```

Exact model file organization may differ slightly.

---

# Completed

## 1. Project Setup

Completed:

- Virtual Environment
- Professional FastAPI folder structure
- Environment configuration
- README
- requirements.txt
- .gitignore

---

# 2. Architecture

Initial architecture:

```text
Client
    │
    ▼
FastAPI Route
    │
    ▼
ChatService
    │
    ▼
Gemini API
```

Principles being followed:

- Thin Routes
- Fat Services
- Configuration inside `core`
- Pydantic validation
- Single Responsibility Principle
- Production-oriented architecture

---

# 3. Configuration

Created:

```text
app/core/config.py
```

Using:

- `BaseSettings`
- `SettingsConfigDict`

Settings include:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `DATABASE_URL`

---

# 4. Basic Chat API

Completed:

- `ChatRequest`
- Initial `ChatResponse`
- `POST /chat`
- Router registration
- Swagger testing
- Gemini API integration

Basic flow:

```text
POST /chat
    │
    ▼
ChatRequest
    │
    ▼
ChatService
    │
    ▼
Gemini API
    │
    ▼
Response
```

Everything is working successfully.

---

# 5. Conversation History

Learned:

- LLM APIs are stateless.
- Gemini does not automatically remember previous API calls.
- The backend is responsible for maintaining conversation history.
- Previous messages must be sent back to Gemini to maintain conversational context.

Initially used:

```python
self.history = []
```

Problem:

All messages were stored in one shared history.

---

# 6. Conversation-Based In-Memory History

Implemented conversation isolation using `conversation_id`.

`ChatRequest` now contains:

```python
class ChatRequest(BaseModel):
    conversation_id: str
    message: str
```

Replaced:

```python
self.history = []
```

with:

```python
self.conversations = {}
```

Conceptual structure:

```python
{
    "conversation-1": [...],
    "conversation-2": [...]
}
```

Each conversation now maintains separate history.

Current flow:

```text
Request
    │
    ▼
conversation_id
    │
    ▼
Find/Create Conversation History
    │
    ▼
Append User Message
    │
    ▼
Send Full History to Gemini
    │
    ▼
Receive Model Response
    │
    ▼
Append Model Response
    │
    ▼
Return Response
```

Conversation isolation was tested successfully with multiple conversation IDs.

Example:

```text
conversation-1
User: My name is Hariom

conversation-2
User: My name is Rahul
```

Gemini correctly remembers the correct name within each separate conversation.

---

# 7. Known Limitations of In-Memory History

Current in-memory implementation has these limitations:

1. Server restart deletes all conversation history.
2. Multiple workers would have separate in-memory histories.
3. History grows indefinitely.
4. It is not suitable for production persistence.

The plan is now to replace:

```python
self.conversations = {}
```

with PostgreSQL-backed conversation storage.

---

# 8. AI Concepts Already Covered

The following topics have already been learned and should NOT be taught again unless needed during implementation:

- LLM basics
- Tokens
- Context Window
- System Prompt
- Prompt Engineering
- Temperature

Skip introductory explanations for these topics.

---

# 9. Structured Output

Implemented Gemini Structured Output using Pydantic.

Created:

```python
class AIResponse(BaseModel):
    answer: str
    category: str
    confidence: float
```

Gemini call uses:

```python
config=types.GenerateContentConfig(
    response_mime_type="application/json",
    response_schema=AIResponse,
)
```

Learned the difference between:

```python
response.text
```

and:

```python
response.parsed
```

`response.text` contains raw JSON as a string.

`response.parsed` contains the parsed Pydantic `AIResponse` object.

Example:

```python
AIResponse(
    answer="Hello!",
    category="Greeting",
    confidence=0.9,
)
```

---

# 10. Structured Output + Conversation History

Important design decision implemented:

Do NOT store the complete structured JSON response in conversational history.

Instead of storing:

```json
{
  "answer": "Hello!",
  "category": "Greeting",
  "confidence": 0.9
}
```

only store:

```text
Hello!
```

Current logic:

```python
ai_response = response.parsed

self.conversations[conversation_id].append(
    {
        "role": "model",
        "parts": [{"text": ai_response.answer}],
    }
)
```

This keeps the Gemini conversation history clean while allowing the API to return structured metadata.

---

# 11. Structured API Response

`ChatService.generate_response()` should return:

```python
AIResponse
```

instead of:

```python
str
```

Conceptually:

```python
def generate_response(
    self,
    request: ChatRequest,
) -> AIResponse:
```

Then:

```python
return ai_response
```

FastAPI route uses:

```python
response_model=AIResponse
```

Since `ChatService` already returns an `AIResponse`, the route should directly return it:

```python
@router.post(
    "/",
    response_model=AIResponse,
    status_code=status.HTTP_200_OK,
)
def chat(request: ChatRequest):
    response = chat_service.generate_response(request)
    return response
```

Do NOT do:

```python
AIResponse(response=response.answer)
```

because `AIResponse` fields are:

```text
answer
category
confidence
```

---

# 12. Current ChatService Concept

Current service conceptually works like:

```python
class ChatService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )
        self.model = settings.GEMINI_MODEL
        self.conversations = {}

    def generate_response(
        self,
        request: ChatRequest,
    ) -> AIResponse:

        conversation_id = request.conversation_id

        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []

        self.conversations[conversation_id].append(
            {
                "role": "user",
                "parts": [{"text": request.message}],
            }
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=self.conversations[conversation_id],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AIResponse,
            ),
        )

        ai_response = response.parsed

        self.conversations[conversation_id].append(
            {
                "role": "model",
                "parts": [
                    {"text": ai_response.answer}
                ],
            }
        )

        return ai_response
```

Note: Actual code currently still needs production improvements.

---

# 13. Known Service-Layer Issue

Current service catches exceptions like:

```python
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=str(e),
    )
```

This works for now but is not the desired production architecture.

`ChatService` ideally should not depend directly on FastAPI's `HTTPException`.

This will be handled later using:

- Custom Exceptions
- Global Exception Handlers

Do not focus on this yet unless reaching the Error Handling phase.

---

# 14. PostgreSQL Setup

PostgreSQL integration has now been started and is working.

Completed:

- PostgreSQL database created.
- SQLAlchemy configured.
- Database connection configured.
- Alembic configured.
- Database models designed.

Created:

```text
app/core/database.py
```

Current implementation:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
```

This provides:

- SQLAlchemy Engine
- Session Factory
- Declarative Base
- FastAPI DB dependency

---

# 15. Conversation Database Model

Created a `Conversation` model.

Current design:

```python
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
```

---

# 16. Message Database Model

Created a `Message` model.

Current design:

```python
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
    )

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey(
            "conversations.id",
            ondelete="CASCADE",
        ),
        index=True,
    )

    role: Mapped[str] = mapped_column(
        String(20)
    )

    content: Mapped[str] = mapped_column(
        Text
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )
```

---

# 17. Database Relationship

Current relationship:

```text
Conversation (1)
      │
      │
      ▼
Message (Many)
```

Database structure:

```text
conversations
├── id
├── title
└── created_at

messages
├── id
├── conversation_id → conversations.id
├── role
├── content
└── created_at
```

Deleting a conversation cascades to its messages.

---

# 18. Suggested Model Improvements

These improvements were discussed but may not yet be implemented.

Use SQLAlchemy 2.x typed relationships:

```python
messages: Mapped[list["Message"]] = relationship(
    "Message",
    back_populates="conversation",
    cascade="all, delete-orphan",
)
```

And:

```python
conversation: Mapped["Conversation"] = relationship(
    "Conversation",
    back_populates="messages",
)
```

Message ordering is important when reconstructing conversation history.

Prefer explicit database queries using:

```text
ORDER BY created_at
```

when loading conversation messages.

This will also make future context-window limiting easier.

---

# Current Architecture Direction

We are transitioning from:

```text
ChatService
    │
    ▼
self.conversations = {}
    │
    ▼
RAM
```

to:

```text
FastAPI Route
    │
    ▼
ChatService
    │
    ▼
SQLAlchemy Session
    │
    ├── Conversation
    │
    └── Messages
    │
    ▼
PostgreSQL

ChatService
    │
    ▼
Gemini API
```

The goal is to remove in-memory conversation history and reconstruct Gemini history from PostgreSQL messages.

---

# Next Step

The immediate next step is to start implementing persistent conversations.

First create a Pydantic schema for returning a conversation.

Suggested schema:

```text
ConversationResponse
├── id
├── title
└── created_at
```

Then implement:

```text
POST /conversations
```

Flow:

```text
POST /conversations
        │
        ▼
Create Conversation
        │
        ▼
Save to PostgreSQL
        │
        ▼
Commit
        │
        ▼
Refresh
        │
        ▼
Return ConversationResponse
```

The backend should generate the UUID.

After that, integrate the Chat API with PostgreSQL:

```text
POST /conversations
        │
        ▼
Get conversation_id

POST /chat
{
    "conversation_id": "...",
    "message": "Hello"
}
        │
        ▼
Validate Conversation
        │
        ▼
Load Previous Messages from PostgreSQL
        │
        ▼
Append Current User Message
        │
        ▼
Send History to Gemini
        │
        ▼
Receive Structured AIResponse
        │
        ├── Save ai_response.answer as assistant message
        │
        └── Return full AIResponse
        │
        ▼
PostgreSQL
```

Do NOT jump directly to the complete implementation.

Continue incrementally.

---

# Future Roadmap

## Current Phase: PostgreSQL Conversation Storage

- ConversationResponse schema
- Create Conversation API
- Database dependency injection
- Save conversations
- Save user messages
- Save assistant messages
- Load conversation history from PostgreSQL
- Remove `self.conversations = {}`
- Reconstruct Gemini-compatible message history
- Test multiple persistent conversations

## Error Handling

- Remove `HTTPException` from service layer
- Custom exceptions
- Global exception handlers
- Gemini API error handling
- Database rollback
- Timeouts

## Production Improvements

- Logging
- Rate Limiting
- Dependency Injection improvements
- Context history limiting/trimming when needed
- Conversation summarization when needed
- Safety settings
- Production best practices

## Later

- Authentication/User ownership
- Associate conversations with users
- Conversation listing
- Conversation details
- Delete conversation
- Update conversation title
- Streaming responses
- React frontend

---

# Instruction for the Next Chat

Assume everything above has already been completed.

Do NOT:

- Restart the project.
- Repeat Python/FastAPI basics.
- Re-explain LLM basics.
- Re-teach Context Window.
- Re-teach System Prompts.
- Re-teach Prompt Engineering.
- Re-teach Temperature.
- Re-teach basic Structured Output concepts.

Continue directly from:

# Next Step: Persistent Conversation Storage

Start by helping me create the `ConversationResponse` Pydantic schema and then implement the `POST /conversations` API.

Use the same mentoring style:

- Short explanations.
- Explain why something is needed.
- Production mindset.
- Give me one small task at a time.
- Let me implement first.
- Review my code after I send it.
- Suggest improvements.
- Continue incrementally.
- Do not provide the entire implementation at once unless I explicitly ask for it.
