# ChatGPT Clone Backend (Learning Mode)

## Goal

Build a production-style ChatGPT Clone Backend using FastAPI + Gemini while learning AI Engineering step by step.

## Teaching Style

- Act as a Senior AI Engineer mentoring a Junior Developer.
- Explain concepts briefly.
- Explain why they're needed.
- Let me implement first.
- Review my code.
- Suggest improvements.
- Then move to the next step.
- Avoid unnecessary theory and Python/FastAPI basics.

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

I also understand:

- LLMs
- Tokens
- Context Window
- Prompt Engineering
- Temperature
- Structured Output

Experience: 2+ years as a MERN Stack Developer.

---

# Tech Stack

- FastAPI
- Gemini API (`google-genai`)
- Pydantic
- pydantic-settings
- Uvicorn
- Postman

Frontend (later): React

---

# Current Project Structure

```
chatgpt_clone/
│
├── app/
│   ├── api/routes/
│   ├── core/config.py
│   ├── schemas/chat.py
│   ├── services/chat_service.py
│   └── main.py
│
├── .env
├── requirements.txt
└── README.md
```

---

# Completed

## Project Setup

- Virtual Environment
- Professional folder structure
- Environment configuration
- README
- requirements.txt
- .gitignore

---

## Architecture

```
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

Principles:

- Thin Routes
- Fat Services
- Configuration in `core`
- Pydantic validation
- Single Responsibility Principle

---

## Configuration

Created:

```
app/core/config.py
```

Using:

- BaseSettings
- SettingsConfigDict

Current settings:

- GEMINI_API_KEY
- GEMINI_MODEL

---

## Chat API

Completed:

- ChatRequest
- ChatResponse
- POST /chat
- Router registration
- Swagger testing

Flow:

```
POST /chat
        │
        ▼
ChatRequest
        │
        ▼
ChatService
        │
        ▼
Gemini
        │
        ▼
ChatResponse
```

Everything is working successfully.

---

# Phase 2 (Current)

## Conversation History

Learned:

- LLMs are stateless.
- Gemini does not remember previous API calls.
- The backend must send the complete conversation every request.

Conversation format:

```
Conversation History
+
Current User Message
↓
Gemini
```

Current implementation:

```python
self.history = []

User
↓

Append User

↓

Send History

↓

Gemini

↓

Append Model

↓

Return Response
```

---

# Code Review

Current implementation is correct for learning.

Current limitations:

1. History is stored in RAM.
2. History is shared by every user.
3. History grows forever.
4. `HTTPException` should not be raised inside services.

Future topics:

- Global Exception Handling
- Context Window
- History Trimming
- Conversation Summarization

---

# Next Step

Implement conversation-based history.

Update request:

```json
{
  "conversation_id": "abc123",
  "message": "Hello"
}
```

Replace:

```python
self.history = []
```

with:

```python
{
    "abc123": [...],
    "xyz789": [...]
}
```

Implementation plan:

1. Add `conversation_id` to `ChatRequest`.
2. Store histories in an in-memory dictionary.
3. Load history using `conversation_id`.
4. Append user message.
5. Send full history to Gemini.
6. Append model response.
7. Save updated history.
8. Test multiple conversations.
9. Explain how this design can later be replaced by PostgreSQL with minimal changes.

---

# Future Roadmap

Phase 2

- Conversation History
- Context Window

Phase 3

- System Prompt
- Prompt Engineering
- Temperature
- Safety Settings

Phase 4

- Structured Output
- Pydantic Validation

Phase 5

- Error Handling
- Timeouts
- Rate Limits

Phase 6

- Logging

Phase 7

- Dependency Injection
- PostgreSQL Conversation Storage
- Production Best Practices

---

# Instruction for the Next Chat

Assume everything above is already completed.

Do **not** restart the project or repeat previous concepts.

Continue from **"Next Step"** using the same mentoring style:

- Short explanations
- Production mindset
- Let me implement first
- Review my code
- Suggest improvements
- Continue incrementally
