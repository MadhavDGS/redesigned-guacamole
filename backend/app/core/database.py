"""
Database Configuration and Models
FRA Atlas - AI-powered Forest Rights Act Atlas and Decision Support System
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData
from geoalchemy2 import Geography, Geometry
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# SQLAlchemy engine for async operations
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Base model class
Base = declarative_base()

# Metadata for table creation
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"
    }
)


class DatabaseManager:
    """Database connection and session management"""
    
    def __init__(self):
        self.engine = engine
        self.session_factory = AsyncSessionLocal
    
    async def get_session(self) -> AsyncSession:
        """Get database session"""
        async with self.session_factory() as session:
            try:
                yield session
            except Exception as e:
                await session.rollback()
                logger.error(f"Database session error: {e}")
                raise
            finally:
                await session.close()
    
    async def create_tables(self):
        """Create all database tables"""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created successfully")
    
    async def drop_tables(self):
        """Drop all database tables (use with caution!)"""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            logger.warning("All database tables dropped")
    
    async def close(self):
        """Close database connections"""
        await engine.dispose()
        logger.info("Database connections closed")


# Global database manager instance
db_manager = DatabaseManager()


# Dependency for FastAPI
async def get_db() -> AsyncSession:
    """FastAPI dependency for database sessions"""
    async for session in db_manager.get_session():
        yield session


# Database health check
async def check_database_health() -> bool:
    """Check if database is accessible"""
    try:
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False