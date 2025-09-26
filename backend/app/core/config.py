"""
Core Configuration Settings
FRA Atlas - AI-powered Forest Rights Act Atlas and Decision Support System
"""

import os
from typing import List, Optional, Union
from datetime import datetime
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings and configuration"""
    
    # Application
    PROJECT_NAME: str = "FRA Atlas"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Security
    SECRET_KEY: str = Field(env="SECRET_KEY", min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOWED_HOSTS: Union[str, List[str]] = Field(default=["*"], env="ALLOWED_HOSTS")
    ALLOWED_ORIGINS: Union[str, List[str]] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    # Database
    POSTGRES_USER: str = Field(default="fra_admin", env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(default="fra_secure_2024", env="POSTGRES_PASSWORD")
    POSTGRES_HOST: str = Field(default="localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: str = Field(default="5432", env="POSTGRES_PORT")
    POSTGRES_DB: str = Field(default="fra_atlas_db", env="POSTGRES_DB")
    
    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # RabbitMQ
    RABBITMQ_USER: str = Field(default="fra_admin", env="RABBITMQ_USER")
    RABBITMQ_PASSWORD: str = Field(default="fra_queue_2024", env="RABBITMQ_PASSWORD")
    RABBITMQ_HOST: str = Field(default="localhost", env="RABBITMQ_HOST")
    RABBITMQ_PORT: int = Field(default=5672, env="RABBITMQ_PORT")
    
    @property
    def RABBITMQ_URL(self) -> str:
        return (
            f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASSWORD}"
            f"@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}//"
        )
    
    # Elasticsearch
    ELASTICSEARCH_HOST: str = Field(default="localhost", env="ELASTICSEARCH_HOST")
    ELASTICSEARCH_PORT: int = Field(default=9200, env="ELASTICSEARCH_PORT")
    
    @property
    def ELASTICSEARCH_URL(self) -> str:
        return f"http://{self.ELASTICSEARCH_HOST}:{self.ELASTICSEARCH_PORT}"
    
    # File Storage
    UPLOAD_DIR: str = Field(default="uploads", env="UPLOAD_DIR")
    MAX_UPLOAD_SIZE: int = Field(default=50 * 1024 * 1024, env="MAX_UPLOAD_SIZE")  # 50MB
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=[".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".shp", ".geojson"],
        env="ALLOWED_EXTENSIONS"
    )
    
    # OCR Settings
    TESSERACT_CMD: Optional[str] = Field(default=None, env="TESSERACT_CMD")
    OCR_LANGUAGES: List[str] = Field(default=["eng", "hin", "ori", "tel"], env="OCR_LANGUAGES")
    
    # Cloud OCR (AWS Textract / Google Document AI)
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    
    GOOGLE_CLOUD_PROJECT: Optional[str] = Field(default=None, env="GOOGLE_CLOUD_PROJECT")
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = Field(default=None, env="GOOGLE_APPLICATION_CREDENTIALS")
    
    # Government API Configuration
    GOV_API_BASE_URL: str = Field(default="https://api.data.gov.in", env="GOV_API_BASE_URL")
    
    # Forest Fire API
    FOREST_FIRE_API_KEY: str = Field(
        default="579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
        env="FOREST_FIRE_API_KEY"
    )
    
    # FRA Claims APIs
    FRA_CLAIMS_API_KEY: str = Field(
        default="579b464db66ec23bdd0000017bc9e4e43c4543227ae43333ed0a32d3",
        env="FRA_CLAIMS_API_KEY"
    )
    
    # ML Model Settings
    MODEL_DIR: str = Field(default="models", env="MODEL_DIR")
    BATCH_SIZE: int = Field(default=32, env="BATCH_SIZE")
    MAX_WORKERS: int = Field(default=4, env="MAX_WORKERS")
    
    # Satellite Data
    GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT: Optional[str] = Field(default=None, env="GEE_SERVICE_ACCOUNT")
    SENTINEL_HUB_CLIENT_ID: Optional[str] = Field(default=None, env="SENTINEL_HUB_CLIENT_ID")
    SENTINEL_HUB_CLIENT_SECRET: Optional[str] = Field(default=None, env="SENTINEL_HUB_CLIENT_SECRET")
    
    # Geospatial Settings
    DEFAULT_CRS: str = Field(default="EPSG:4326", env="DEFAULT_CRS")
    WEB_MERCATOR_CRS: str = Field(default="EPSG:3857", env="WEB_MERCATOR_CRS")
    
    # Target States
    TARGET_STATES: Union[str, List[str]] = Field(
        default=["Madhya Pradesh", "Tripura", "Odisha", "Telangana"],
        env="TARGET_STATES"
    )
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # Monitoring
    ENABLE_METRICS: bool = Field(default=True, env="ENABLE_METRICS")
    METRICS_PORT: int = Field(default=8001, env="METRICS_PORT")
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v) -> List[str]:
        if isinstance(v, str):
            if not v or v.strip() == "":
                return ["*"]  # Default fallback
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]  # Default fallback for any other type

    @validator("ALLOWED_HOSTS", pre=True)
    def parse_allowed_hosts(cls, v) -> List[str]:
        if isinstance(v, str):
            if not v or v.strip() == "":
                return ["*"]  # Default fallback
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]  # Default fallback for any other type

    @validator("TARGET_STATES", pre=True)
    def parse_target_states(cls, v) -> List[str]:
        if isinstance(v, str):
            if not v or v.strip() == "":
                return ["*"]  # Default fallback
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]  # Default fallback for any other type    @validator("SECRET_KEY")
    def validate_secret_key(cls, v):
        if not v:
            raise ValueError("SECRET_KEY must be provided in production")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long for security")
        return v
    
    @staticmethod
    def get_current_timestamp() -> str:
        """Get current timestamp in ISO format"""
        return datetime.utcnow().isoformat()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()


# Environment-specific configurations
class DevelopmentConfig(Settings):
    """Development environment configuration"""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"


class ProductionConfig(Settings):
    """Production environment configuration"""
    DEBUG: bool = False
    LOG_LEVEL: str = "WARNING"
    ALLOWED_HOSTS: List[str] = ["fra-atlas.gov.in", "api.fra-atlas.gov.in"]


class TestConfig(Settings):
    """Test environment configuration"""
    POSTGRES_DB: str = "fra_atlas_test_db"
    REDIS_DB: int = 1
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"


def get_config() -> Settings:
    """Get configuration based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionConfig()
    elif env == "test":
        return TestConfig()
    else:
        return DevelopmentConfig()