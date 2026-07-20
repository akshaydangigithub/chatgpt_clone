from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.conversation import router as conversation_router
from app.core.config import settings
from app.exceptions.handlers import register_exception_handlers
from app.core.logging import setup_logging
from app.middleware.request_id import request_id_middleware

setup_logging()

app = FastAPI(
    title="ChatGPT Clone API",
    description="Backend API for ChatGPT Clone using Gemini",
    version="1.0.0",
)
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

app.middleware("http")(request_id_middleware)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversation_router)


@app.get("/")
def root() -> dict:
    return {"message": "ChatGPT Clone API is running"}
