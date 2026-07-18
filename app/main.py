from fastapi import FastAPI
from app.api.routes.chat import router as chat_router
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

app.middleware("http")(request_id_middleware)

app.include_router(chat_router)


@app.get("/")
def root() -> dict:
    return {"message": "ChatGPT Clone API is running"}
