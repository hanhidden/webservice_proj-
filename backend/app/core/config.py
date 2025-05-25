# app/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    MONGO_DB_NAME: str  # this expects the env variable MONGO_DB_NAME to be set

    class Config:
        env_file = ".env"  # points to your environment variables file

settings = Settings()

