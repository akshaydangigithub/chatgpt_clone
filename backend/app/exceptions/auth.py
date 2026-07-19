class AuthError(Exception):
    """Base class for authentication / authorization errors."""

    def __init__(self, message: str = "Authentication error."):
        super().__init__(message)


class UserAlreadyExistsError(AuthError):
    def __init__(self):
        super().__init__("A user with this username or email already exists.")


class InvalidCredentialsError(AuthError):
    def __init__(self):
        super().__init__("Invalid username or password.")


class InvalidTokenError(AuthError):
    def __init__(self):
        super().__init__("Could not validate credentials.")
