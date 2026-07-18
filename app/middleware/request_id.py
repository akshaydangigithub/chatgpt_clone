import uuid

from fastapi import Request

from app.core.context import request_id_context


async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())

    request.state.request_id = request_id

    token = request_id_context.set(request_id)

    try:
        response = await call_next(request)
    finally:
        request_id_context.reset(token)

    response.headers["X-Request-ID"] = request_id

    return response
