from pydantic import BaseSettings
class settings(BaseSettings):
    MODULE_NAME: str = "Module AI " 
    VERSION: str = "1.1.2"
    APP : str = "cpu"
    YOLOV8_CONFIG_PATH: str = "app/configs/yolov8.config.yaml"
    DEEPSORT_CONFIG_PATH: str = "app/configs/deepsort.config.yaml"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    REDIS_EXPIRE_TIME: int = 3600  
class settings_dev(settings):
    MODULE_NAME: str = "Module AI Dev"
    VERSION: str = "1.1.2-dev"
    VIDEO_SOURCE: str = "D:\NCKH_2\MODULE_AI\storage\videos\video_1.mp4"
settings_dev = settings_dev()


