from fastapi import APIRouter, status
from concurrent.futures import ThreadPoolExecutor, Future
import threading
import logging
from app.utils.exception_handle import CustomException
from app.processing.stream_processing import StreamProcessor
router_tracking = APIRouter(
    prefix="/api/v1/tracking",
    tags=["tracking"],
)
executor = ThreadPoolExecutor(max_workers=5)
active_futures: dict[str, Future] = {}
stream_lock = threading.Lock()
active_processors: dict[str, StreamProcessor] = {}
# khởi tạo StreamProcessor một lần duy nhất 
def get_stream_processor(url_rtsp: str) -> StreamProcessor:
    if url_rtsp not in active_processors:
        active_processors[url_rtsp] = StreamProcessor()
        return active_processors[url_rtsp]
    else:
        return active_processors[url_rtsp]

        
@router_tracking.get("/process", status_code=status.HTTP_200_OK)
async def process_tracking(url_rtsp: str):
    try:   
        clean_url = str(url_rtsp).strip().strip('"').strip("'")
        with stream_lock:
            if clean_url in active_futures:
                future = active_futures[clean_url]
                if not future.done():
                    logging.info(f"Stream {clean_url} is already being processed.")
                    return {"status": "already processing"}
                else:
                    logging.info(f"Stream {clean_url} has finished processing. Restarting...")
                    del active_futures[clean_url]
                    if clean_url in active_processors:
                        del active_processors[clean_url]
        processor = get_stream_processor(url_rtsp=clean_url)
        active_futures[clean_url] = executor.submit(processor.process_stream, clean_url)
        return {
                "status": "started", 
                "message": f"AI Consumer triggered for {clean_url}",
                "active_streams": list(active_futures.keys())
            }
    except Exception as e:
        error_data = CustomException(
            message="Failed to start processing stream",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=str(e)
        ).to_dict()
        logging.exception(error_data)

@router_tracking.get("/stopped")
def stop_tracking(url_rtsp: str):
    clear_url = str(url_rtsp).strip().strip('"').strip("'")
    
    # Tìm processor mà không giữ Lock quá lâu
    processor_to_stop = None
    with stream_lock:
        if clear_url in active_processors:
            processor_to_stop = active_processors[clear_url]
            # Xóa khỏi danh sách để các request mới không đụng vào nó nữa
            del active_processors[clear_url] 
            if clear_url in active_futures:
                del active_futures[clear_url]

    # Thực hiện lệnh dừng NGOÀI khối Lock
    if processor_to_stop:
        processor_to_stop.stop()
        return {"status": "stopped", "url": clear_url}
    
    return {"status": "not found"}