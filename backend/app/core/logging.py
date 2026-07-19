import logging
from datetime import datetime

from rich.console import Console
from rich.logging import RichHandler
from rich.text import Text

from app.core.context import request_id_context


class RequestContextFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_context.get() or "-"
        return True


class CompactRichHandler(RichHandler):
    """Compact colorful log output."""

    LEVEL_STYLES = {
        "DEBUG": ("🔵", "cyan"),
        "INFO": ("🟢", "green"),
        "WARNING": ("🟡", "yellow"),
        "ERROR": ("🔴", "red"),
        "CRITICAL": ("💥", "bold red"),
    }

    def render_message(self, record, message):
        icon, color = self.LEVEL_STYLES.get(record.levelname, ("⚪", "white"))

        time = datetime.now().strftime("%H:%M:%S")
        logger = record.name[:28].ljust(28)
        req = getattr(record, "request_id", "-")[:8].ljust(8)

        text = Text()

        # Time
        text.append(time, style="dim white")
        text.append(" │ ")

        # Level
        text.append(icon + " ", style=color)
        text.append(record.levelname.ljust(8), style=f"bold {color}")
        text.append(" │ ")

        # Logger
        text.append(logger, style="bright_cyan")
        text.append(" │ ")

        # Request ID
        text.append(req, style="bold yellow")
        text.append(" │ ")

        # Message
        text.append(message, style="white")

        return text


def setup_logging():
    console = Console(
        force_terminal=True,
        soft_wrap=True,
    )

    handler = CompactRichHandler(
        console=console,
        show_time=False,
        show_level=False,
        show_path=False,
        markup=False,
        rich_tracebacks=True,
        tracebacks_show_locals=True,
    )

    handler.addFilter(RequestContextFilter())

    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(logging.INFO)
    root.addHandler(handler)

    # Keep uvicorn readable
    for name in (
        "uvicorn",
        "uvicorn.error",
        "uvicorn.access",
    ):
        logging.getLogger(name).handlers = []
        logging.getLogger(name).propagate = True

    # Optional: reduce noisy libraries
    logging.getLogger("httpcore").setLevel(logging.WARNING)
