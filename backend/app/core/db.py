from typing import Optional
import asyncpg
import motor.motor_asyncio
import redis.asyncio as aioredis
from .config import settings

_pg_pool: Optional[asyncpg.Pool] = None
_mongo_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
_redis: Optional[aioredis.Redis] = None

async def get_pg_pool() -> asyncpg.Pool:
    global _pg_pool
    if _pg_pool is None:
        _pg_pool = await asyncpg.create_pool(settings.database_url)
    return _pg_pool

async def get_mongo() -> motor.motor_asyncio.AsyncIOMotorClient:
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_url)
    return _mongo_client

async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(settings.redis_url)
    return _redis

async def close():
    global _pg_pool, _mongo_client, _redis
    if _pg_pool:
        await _pg_pool.close()
        _pg_pool = None
    if _mongo_client:
        _mongo_client.close()
        _mongo_client = None
    if _redis:
        await _redis.close()
        _redis = None