from datetime import datetime, timedelta
from enum import Enum
import logging

from app.exceptions.ai import AICircuitOpenError

logger = logging.getLogger(__name__)


class CircuitState(str, Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    def __init__(
        self,
        max_failures: int = 5,
        recovery_timeout: int = 30,
    ):
        self.max_failures = max_failures
        self.recovery_timeout = recovery_timeout

        self.failure_count = 0
        self.opened_at: datetime | None = None
        self.state = CircuitState.CLOSED

    def before_request(self) -> None:
        """
        Called before making an external API request.

        Raises:
            AICircuitOpenError: If the circuit is open and the
            recovery timeout has not expired.
        """

        if self.state == CircuitState.CLOSED:
            return

        if self.state == CircuitState.HALF_OPEN:
            return

        if self.opened_at is None:
            raise RuntimeError("Circuit is OPEN but opened_at is missing.")

        if datetime.now() >= (
            self.opened_at + timedelta(seconds=self.recovery_timeout)
        ):
            self.state = CircuitState.HALF_OPEN
            logger.info("Circuit moved to HALF_OPEN")
            return

        raise AICircuitOpenError()

    def record_success(self) -> None:
        """
        Called when the external request succeeds.
        Resets the circuit back to the healthy state.
        """

        if self.state == CircuitState.HALF_OPEN:
            logger.info("Circuit closed after successful recovery")

        self.failure_count = 0
        self.opened_at = None
        self.state = CircuitState.CLOSED

    def record_failure(self) -> None:
        """
        Called when the external request fails.
        """

        if self.state == CircuitState.HALF_OPEN:
            self._open()
            return

        self.failure_count += 1

        if self.failure_count >= self.max_failures:
            self._open()

    def _open(self) -> None:
        """
        Opens the circuit and starts the recovery timer.
        """

        self.state = CircuitState.OPEN
        self.failure_count = self.max_failures
        self.opened_at = datetime.now()

        logger.warning(
            "Circuit opened after %s consecutive failures",
            self.failure_count,
        )
