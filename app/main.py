from fastapi import FastAPI
from app.api.routes.chat import router as chat_router

app = FastAPI(
    title="ChatGPT Clone API",
    description="Backend API for ChatGPT Clone using Gemini",
    version="1.0.0",
)

app.include_router(chat_router)


@app.get("/")
def root() -> dict:
    return {"message": "ChatGPT Clone API is running"}
