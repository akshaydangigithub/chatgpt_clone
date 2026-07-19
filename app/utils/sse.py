import json
from typing import Any


def format_sse(event: str, data: dict[str, Any]) -> str:
    """
    Format an SSE event.

    Example:
        event: message
        data: {"text":"Hello"}

    """

    return f"event: {event}\n" f"data: {json.dumps(data)}\n\n"


def format_message(text: str) -> str:
    return format_sse(
        event="message",
        data={"text": text},
    )


def format_done() -> str:
    return format_sse(
        event="done",
        data={},
    )


def format_heartbeat() -> str:
    """
    SSE comment line used as a keep-alive ping.

    Comment lines (starting with ':') are ignored by EventSource clients
    but keep the connection and any intermediary proxies from timing out.
    """

    return ": heartbeat\n\n"


def format_error(message: str) -> str:
    return format_sse(
        event="error",
        data={
            "message": message,
        },
    )
