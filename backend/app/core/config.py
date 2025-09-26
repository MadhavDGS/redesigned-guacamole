from pydantic import BaseModel
import os

class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://fra:fra@localhost:5432/fra")
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret")

settings = Settings()