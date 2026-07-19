from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GEMINI_MODEL: str
    DATABASE_URL: str
    GEMINI_TIMEOUT: int = 30_000  # 30 seconds

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
