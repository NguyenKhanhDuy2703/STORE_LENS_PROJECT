from fastapi import APIRouter, status
from multiprocessing import Process, Event
import threading
import logging
from app.utils.exception_handle import CustomException
from app.processing.stream_processing import StreamProcessor
from typing import Optional
router_tracking = APIRouter(
    prefix="/api/v1/tracking",
    tags=["tracking"],
)


def run_stream_process(url_rtsp: str, list_zone, stop_event: Event) -> None:
    processor = StreamProcessor()
    processor.process_stream(url_rtsp, list_zone, stop_event)

active_processes: dict[str, Process] = {} #save url_rtsp and process
stop_signals: dict[str, Event] = {} # save url_rtsp and stop event
stream_lock = threading.Lock() 
mock_zones = [
    {
        "name": "ZONE_A_TREADMILL",
        "points": [[100, 100], [500, 100], [500, 500], [100, 500]]
    },
    {
        "name": "ZONE_B_WEIGHT",

        "points": [[700, 100], [1100, 100], [1100, 500], [700, 500]]
    },
    {
        "name": "ZONE_C_OVERLAP",
        "points": [[400, 300], [800, 300], [800, 700], [400, 700]]
    }
]
@router_tracking.get("/process", status_code=status.HTTP_200_OK )
async def process_tracking(url_rtsp: str , list_zone: Optional[dict] = None):
    try:   
        clean_url = str(url_rtsp).strip().strip('"').strip("'")
        
        with stream_lock:
            if clean_url in active_processes:
                if active_processes[clean_url].is_alive(): 
                    return {
                        "status_code": status.HTTP_200_OK,  
                        "message": f"Stream already being processed for {clean_url}",
                    }
                else:
                    del active_processes[clean_url] 
                    if clean_url in stop_signals:
                        del stop_signals[clean_url]
            
       
            stop_event = Event()
            
            print(mock_zones)
            process = Process(target=run_stream_process, args=(clean_url, mock_zones, stop_event))
            process.start()
            
            active_processes[clean_url] = process
            stop_signals[clean_url] = stop_event

        return {
            "status_code": status.HTTP_200_OK,  
            "message": f"AI Consumer triggered for {clean_url}",
            "active_streams": list(active_processes.keys())
        }
    except Exception as e:
        error_data = CustomException(
            message="Failed to start processing stream",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=str(e)
        ).to_dict()
        logging.exception(error_data)
        return error_data

@router_tracking.get("/stopped")
def stop_tracking(url_rtsp: str):
    clean_url = str(url_rtsp).strip().strip('"').strip("'")
    
    with stream_lock:
        if clean_url in active_processes:
            p = active_processes[clean_url]
            
            if p.is_alive():
                stop_signals[clean_url].set()
                p.join(timeout=5)
                if p.is_alive():
                    logging.warning(f"Process {clean_url} hung. Terminating forcibly.")
                    p.terminate()
        
            del active_processes[clean_url]
            if clean_url in stop_signals:
                del stop_signals[clean_url]
                
            return {
                "status_code": status.HTTP_200_OK,  
                "message": f"Stream processing stopped for {clean_url}",
                "active_streams": list(active_processes.keys())
            }
    
    return {"status": "not found", "url": clean_url}