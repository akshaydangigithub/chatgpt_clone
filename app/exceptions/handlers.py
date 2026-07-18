from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions.conversation import ConversationNotFoundError
from app.exceptions.ai import (
    AIServiceError,
    AIRateLimitError,
    AITimeoutError,
    AIInvalidResponseError,
    AIAuthenticationError,
)


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(ConversationNotFoundError)
    async def conversation_not_found_handler(
        request: Request,
        exc: ConversationNotFoundError,
    ):
        return JSONResponse(
            status_code=404,
            content={"detail": str(exc)},
        )

    @app.exception_handler(AIRateLimitError)
    async def ai_rate_limit_handler(
        request: Request,
        exc: AIRateLimitError,
    ):
        return JSONResponse(
            status_code=429,
            content={"detail": "AI provider rate limit exceeded."},
        )

    @app.exception_handler(AITimeoutError)
    async def ai_timeout_handler(
        request: Request,
        exc: AITimeoutError,
    ):
        return JSONResponse(
            status_code=504,
            content={"detail": "AI provider request timed out."},
        )

    @app.exception_handler(AIAuthenticationError)
    async def ai_authentication_handler(
        request: Request,
        exc: AIAuthenticationError,
    ):
        return JSONResponse(
            status_code=401,
            content={"detail": "AI provider authentication failed."},
        )

    @app.exception_handler(AIInvalidResponseError)
    async def ai_invalid_response_handler(
        request: Request,
        exc: AIInvalidResponseError,
    ):
        return JSONResponse(
            status_code=502,
            content={"detail": "AI provider returned an invalid response."},
        )

    @app.exception_handler(AIServiceError)
    async def ai_service_handler(
        request: Request,
        exc: AIServiceError,
    ):
        return JSONResponse(
            status_code=503,
            content={"detail": "AI service is currently unavailable."},
        )

    @app.exception_handler(Exception)
    async def internal_server_error_handler(
        request: Request,
        exc: Exception,
    ):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )
