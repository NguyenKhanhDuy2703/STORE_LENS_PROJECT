from app.config import settings_dev
from redis import Redis
class RedisPublisher:
    def __init__(self):
        self.redis_client = Redis(
            host=settings_dev.REDIS_HOST,
            port=settings_dev.REDIS_PORT,
            db=settings_dev.REDIS_DB,
            password=settings_dev.REDIS_PASSWORD,
            decode_responses=True
        )
    def publish(self, channel: str, message: dict):
        try:
            self.redis_client.publish(channel, str(message))
            # if channel == "dwell_time_channel" :
            #     print(f"Published to Redis channel '{channel}': {message}")
        except Exception as e:
            raise Exception(f"Error publishing to Redis: {str(e)}")
    def redis_storage(self , vaule: dict ):
        try:
            self.redis_client.setex(vaule["key"],  settings_dev.REDIS_EXPIRE_TIME, str(vaule["value"]))
        except Exception as e:
            raise Exception(f"Error storing data in Redis: {str(e)}")
    