import logging
import sys

LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO) 

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    
    if logger.hasHandlers():
        logger.handlers.clear()
        
    logger.addHandler(console_handler)
    logging.getLogger("uvicorn.access").handlers = [console_handler]
    logging.getLogger("uvicorn.error").handlers = [console_handler]
