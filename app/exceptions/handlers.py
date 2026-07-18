import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions.conversation import ConversationNotFoundError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI):

    @app.exception_handler(ConversationNotFoundError)
    async def conversation_not_found_handler(
        request: Request,
        exc: ConversationNotFoundError,
    ):
        return JSONResponse(
            status_code=404,
            content={
                "detail": str(exc),
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request,
        exc: Exception,
    ):
        logger.exception(exc)

        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal Server Error",
            },
        )
