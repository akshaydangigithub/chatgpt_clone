class AIServiceError(Exception):
    def __init__(self, message: str = "AI service is unavailable."):
        super().__init__(message)


class AIRateLimitError(AIServiceError):
    def __init__(self):
        super().__init__("AI provider rate limit exceeded.")


class AITimeoutError(AIServiceError):
    def __init__(self):
        super().__init__("AI provider request timed out.")


class AIInvalidResponseError(AIServiceError):
    def __init__(self):
        super().__init__("AI provider returned an invalid response.")


class AIAuthenticationError(AIServiceError):
    def __init__(self):
        super().__init__("AI provider authentication failed.")
