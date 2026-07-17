# ChatGPT Clone Backend

A production-oriented **ChatGPT Clone Backend** built with **FastAPI, Google Gemini, PostgreSQL, SQLAlchemy, and Alembic**.

The project demonstrates how to build a scalable conversational AI backend with conversation management, persistent message history, structured LLM responses, and clean backend architecture.

The project is being developed incrementally with a focus on practical **AI Engineering** and production-ready backend design.

---

## Features

### Currently Implemented

- FastAPI REST API
- Google Gemini API integration
- Conversation-based chat
- Multi-conversation support
- Conversation history management
- Structured AI responses
- Pydantic response validation
- PostgreSQL database integration
- SQLAlchemy 2.x ORM
- Alembic database migrations
- Conversation and Message database models
- Environment-based configuration
- Clean service-based architecture

### In Progress

- Persistent conversation history
- Create Conversation API
- Store user and assistant messages in PostgreSQL
- Load conversation history from PostgreSQL
- Replace in-memory conversation storage

### Planned

- Global exception handling
- Custom exceptions
- Logging
- Rate limiting
- Context history management
- Conversation summarization
- Safety settings
- Streaming AI responses
- Authentication and user management
- User-specific conversations
- Conversation CRUD APIs
- React frontend
- Production deployment

---

## Tech Stack

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn

### AI

- Google Gemini
- `google-genai`

### Database

- PostgreSQL
- SQLAlchemy 2.x
- Alembic

### Configuration

- `pydantic-settings`
- Environment Variables

---

## Architecture

The application follows a layered architecture with thin API routes and service-based business logic.

```text
Client
   │
   ▼
FastAPI Routes
   │
   ▼
Service Layer
   │
   ├──────────────► Gemini API
   │
   ▼
SQLAlchemy
   │
   ▼
PostgreSQL
```

### Main Principles

- Thin Routes
- Service Layer for business logic
- Pydantic for request and response validation
- SQLAlchemy ORM for database operations
- Alembic for database migrations
- Environment-based configuration
- Separation of concerns
- Production-oriented project structure

---

## Project Structure

```text
chatgpt_clone/
│
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── chat.py
│   │       └── conversations.py
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
├── .gitignore
├── alembic.ini
├── requirements.txt
└── README.md
```

> The project structure may evolve as additional features such as authentication, repositories, logging, and dependency injection are introduced.

---

## Conversation Flow

The chat system maintains separate histories for individual conversations.

```text
User Request
     │
     ▼
Conversation ID
     │
     ▼
Load Conversation
     │
     ▼
Load Previous Messages
     │
     ▼
Add Current User Message
     │
     ▼
Build Gemini Conversation History
     │
     ▼
Gemini API
     │
     ▼
Structured AI Response
     │
     ▼
Save Assistant Message
     │
     ▼
Return Response
```

The long-term goal is to store all conversation history in PostgreSQL so conversations persist across server restarts and multiple application instances.

---

## Database Design

The application currently uses two main entities.

### Conversation

Represents an individual chat conversation.

```text
Conversation
├── id
├── title
├── created_at
└── messages
```

### Message

Represents a user or assistant message belonging to a conversation.

```text
Message
├── id
├── conversation_id
├── role
├── content
└── created_at
```

### Relationship

```text
Conversation
     │
     │ 1 : N
     ▼
Messages
```

Deleting a conversation also deletes its associated messages through cascading deletion.

---

## Structured AI Responses

Gemini responses are generated using structured output and validated using Pydantic.

Example response:

```json
{
  "answer": "FastAPI is a modern Python web framework.",
  "category": "programming",
  "confidence": 0.95
}
```

The corresponding Pydantic model:

```python
class AIResponse(BaseModel):
    answer: str
    category: str
    confidence: float
```

Gemini is configured to follow this response schema using the `google-genai` SDK.

Only the actual `answer` is stored as the assistant's conversational message, while metadata such as `category` and `confidence` can be returned through the API.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd chatgpt_clone
```

---

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it:

#### Linux / macOS

```bash
source venv/bin/activate
```

#### Windows

```bash
venv\Scripts\activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

Do not commit the `.env` file to version control.

---

### 5. Create the PostgreSQL Database

Create a PostgreSQL database matching the database name configured in `DATABASE_URL`.

Example:

```sql
CREATE DATABASE chatgpt_clone;
```

---

### 6. Run Database Migrations

Apply existing Alembic migrations:

```bash
alembic upgrade head
```

When database models change, create a new migration:

```bash
alembic revision --autogenerate -m "migration description"
```

Then apply it:

```bash
alembic upgrade head
```

---

### 7. Start the Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available locally.

---

## API Documentation

FastAPI automatically provides interactive API documentation.

After starting the server, open:

```text
/docs
```

for Swagger UI.

You can use Swagger or Postman to test the APIs.

---

## Chat Request

Example request:

```json
{
  "conversation_id": "conversation-id",
  "message": "Hello"
}
```

Example structured response:

```json
{
  "answer": "Hello! How can I help you?",
  "category": "Greeting",
  "confidence": 0.95
}
```

---

## Current Development Roadmap

### Phase 1 — Core Chat

- [x] FastAPI project setup
- [x] Gemini API integration
- [x] Basic Chat API
- [x] Pydantic validation

### Phase 2 — Conversation Management

- [x] Conversation history
- [x] Multiple conversation isolation
- [x] In-memory conversation storage
- [x] Conversation and Message database models
- [ ] Create Conversation API
- [ ] Persist messages in PostgreSQL
- [ ] Load conversation history from PostgreSQL
- [ ] Remove in-memory conversation storage

### Phase 3 — AI Engineering

- [x] Context Window concepts
- [x] System Prompts
- [x] Prompt Engineering
- [x] Temperature
- [x] Structured Output
- [x] Pydantic structured response validation
- [ ] Safety settings
- [ ] Context history management
- [ ] Conversation summarization

### Phase 4 — Production Improvements

- [ ] Custom exceptions
- [ ] Global exception handling
- [ ] Database rollback handling
- [ ] Gemini API error handling
- [ ] Timeouts
- [ ] Rate limiting
- [ ] Logging

### Phase 5 — Advanced Features

- [ ] Authentication
- [ ] User-specific conversations
- [ ] Conversation CRUD
- [ ] Streaming responses
- [ ] React frontend
- [ ] Production deployment

---

## Development Philosophy

This project is built incrementally rather than implementing every production feature at once.

The goal is to understand each layer of a real conversational AI system:

```text
LLM Integration
      +
Conversation Management
      +
Structured Output
      +
Persistent Storage
      +
Error Handling
      +
Production Architecture
      =
Production-Style AI Backend
```

Each feature is implemented, tested, reviewed, and improved before moving to the next stage.

---

## License

This project is intended for learning and development purposes.
