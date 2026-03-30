from fastapi import APIRouter, status
from multiprocessing import Process, Event
import threading
import logging
from app.utils.exception_handle import CustomException
from app.processing.stream_processing import StreamProcessor
from typing import Optional , List
from pydantic import BaseModel
router_tracking = APIRouter(
    prefix="/api/v1/tracking",
    tags=["tracking"],
)
class ZoneItem(BaseModel):
    name: str
    points: List[List[int]]  

class TrackingRequest (BaseModel):
    list_zone: List[ZoneItem]
    url_rtsp: str
    camera_id: Optional[str] = None
    location_id: Optional[str] = None

def run_stream_process(url_rtsp: str, list_zone, camera_id , location_id, stop_event: Event) -> None:
    processor = StreamProcessor()
    processor.process_stream(url_rtsp, list_zone , camera_id, location_id , stop_event)

active_processes: dict[str, Process] = {} #save url_rtsp and process
stop_signals: dict[str, Event] = {} # save url_rtsp and stop event
stream_lock = threading.Lock() 

@router_tracking.post("/process", status_code=status.HTTP_200_OK )
async def process_tracking(request: TrackingRequest):
    try:  
        print(request)
        clean_url = str(request.url_rtsp).strip().strip('"').strip("'")
        list_zone = request.list_zone 
        camera_id = request.camera_id
        location_id = request.location_id
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
            
            process = Process(target=run_stream_process, args=(clean_url, list_zone, camera_id , location_id, stop_event))
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