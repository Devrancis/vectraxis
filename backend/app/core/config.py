import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    STIX_CACHE_TTL_DAYS: int = int(os.getenv("STIX_CACHE_TTL_DAYS", "7"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    class Config:
        env_file = ".env"

settings = Settings()