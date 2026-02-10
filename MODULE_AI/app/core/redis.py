import redis.asyncio as redis
from app.config import settings_dev


redis_client = redis.Redis(
    host=settings_dev.REDIS_HOST,
    port=settings_dev.REDIS_PORT,
    db=0,
    decode_responses=True,
    encoding="utf-8"
)