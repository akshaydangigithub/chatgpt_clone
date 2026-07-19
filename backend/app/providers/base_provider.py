import logging
from collections.abc import AsyncIterator, Awaitable, Callable
from typing import NoReturn, TypeVar

from pydantic import ValidationError

from app.core.circuit_breaker import CircuitBreaker
from app.exceptions.ai import (
    AIInvalidResponseError,
    AIServiceError,
    AITimeoutError,
)
from app.providers.base import AIProvider

T = TypeVar("T")


class BaseAIProvider(AIProvider):
    """
    Shared behavior for every concrete AI provider.

    Wraps provider calls with circuit-breaker guarding, standardized logging,
    and exception mapping, so individual providers only need to contain their
    vendor-specific request/response code.

    Concrete providers still implement ``generate_response``, ``stream_response``
    and ``generate_title`` (from :class:`AIProvider`) — they just delegate the
    cross-cutting concerns to the ``_execute_*`` helpers below.
    """

    #: Human-readable provider name used in log lines. Override per provider.
    name: str = "AIProvider"

    def __init__(self, breaker: CircuitBreaker):
        self.breaker = breaker
        self.logger = logging.getLogger(self.__class__.__module__)

    def _execute_sync(self, operation: str, func: Callable[[], T]) -> T:
        """Run a synchronous provider call with resilience + logging."""

        self.breaker.before_request()
        try:
            self.logger.info("%s | %s | started", self.name, operation)
            result = func()
            self.breaker.record_success()
            self.logger.info("%s | %s | completed", self.name, operation)
            return result
        except Exception as exc:
            self._handle_failure(operation, exc)

    async def _execute_async(
        self,
        operation: str,
        func: Callable[[], Awaitable[T]],
    ) -> T:
        """Run an async provider call with resilience + logging."""

        self.breaker.before_request()
        try:
            self.logger.info("%s | %s | started", self.name, operation)
            result = await func()
            self.breaker.record_success()
            self.logger.info("%s | %s | completed", self.name, operation)
            return result
        except Exception as exc:
            self._handle_failure(operation, exc)

    async def _execute_stream(
        self,
        operation: str,
        func: Callable[[], AsyncIterator[str]],
    ) -> AsyncIterator[str]:
        """Run an async streaming provider call with resilience + logging."""

        self.breaker.before_request()
        try:
            self.logger.info("%s | %s | started", self.name, operation)
            async for chunk in func():
                yield chunk
            self.breaker.record_success()
            self.logger.info("%s | %s | completed", self.name, operation)
        except Exception as exc:
            self._handle_failure(operation, exc)

    def _handle_failure(self, operation: str, exc: Exception) -> NoReturn:
        """Record the failure with the breaker and re-raise a mapped error."""

        self.breaker.record_failure()
        self.logger.exception("%s | %s | failed", self.name, operation)
        raise self._map_exception(exc) from exc

    def _map_exception(self, exc: Exception) -> Exception:
        """Translate a raw vendor/SDK error into a custom AI exception."""

        if isinstance(exc, AIServiceError):
            return exc

        if isinstance(exc, ValidationError):
            return AIInvalidResponseError()

        if isinstance(exc, TimeoutError):
            return AITimeoutError()

        return AIServiceError(f"Unexpected AI provider error: {exc}")
