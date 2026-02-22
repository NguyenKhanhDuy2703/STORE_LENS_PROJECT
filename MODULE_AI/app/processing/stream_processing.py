from ..core import object_tracking
from ..config import settings_dev
from collections import deque
import cv2
import threading
import logging
import time
yolo_model_path = settings_dev.read_yaml_config(settings_dev.YOLOV8_CONFIG_PATH)
deepsort_model_path = settings_dev.read_yaml_config(settings_dev.DEEPSORT_CONFIG_PATH)
source_video = settings_dev.VIDEO_SOURCE
class StreamProcessor:
    
    def __init__(self):
        self.object_tracker = object_tracking.ObjectTracking({
            "yolov8_config_path": yolo_model_path,
            "deepsort_config_path": deepsort_model_path
        })
        self.frame_queue = deque(maxlen=50)
        self.stopped = False
    def _read_frames(self, url_rtsp):

        input_source = source_video if url_rtsp.split("-")[0] == 'test' else url_rtsp
        cap = cv2.VideoCapture(input_source)
        
        if not cap.isOpened():
            logging.error(f"Failed to open stream: {input_source}")
            self.stopped = True
            return
        try:
            while not self.stopped:
                if len(self.frame_queue) >= 50:
                    time.sleep(0.01) 
                    continue

                ret, frame = cap.read()
                if not ret:
                    logging.warning(f"Stream ended or failed: {input_source}")
                    break
                
                self.frame_queue.append(frame)
        except Exception as e:
            logging.error(f"Error while reading frames: {e}")
        finally:
            cap.release()
            self.stopped = True
    def draw_tracks(self, frame, tracks):
        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = track.track_id
            ltrb = track.to_ltrb() 
            seed = int(str(track_id).split('-')[-1]) if '-' in str(track_id) else int(track_id)
            color = (
                (seed * 123) % 256, 
                (seed * 456) % 256, 
                (seed * 789) % 256
            )
            x1, y1, x2, y2 = map(int, ltrb)
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f"ID: {track_id}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        return frame
    def process_stream(self, url_rtsp): 
        try:
            self.stopped = False
            self.frame_queue.clear()
            windown_name = f"AI Tracking - {url_rtsp}"
            read_thread = threading.Thread(target=self._read_frames, args=(url_rtsp,))
            read_thread.daemon = True
            read_thread.start()
            
            logging.info(f"AI Consumer started for {url_rtsp}")
            time.sleep(1) 
            while not self.stopped :
                if len(self.frame_queue) == 0:
                    time.sleep(0.01)
                    continue
                
                frame = self.frame_queue.popleft()
                
                tracks = self.object_tracker.process_signle_frame(frame)
                frame = self.draw_tracks(frame, tracks)

                cv2.imshow(windown_name, frame)
                if cv2.waitKey(25) & 0xFF == ord('q'):
                    self.stopped = True
                    break
        except Exception as e:
            logging.exception(f"Critical error in process_stream")
            raise Exception(f"Error processing stream {url_rtsp}: {str(e)}")            
        finally:
            self.stopped = True
            for _ in range(5):
                cv2.waitKey(1)
            cv2.destroyWindow(windown_name)
    def stop(self):
        self.stopped = True
        return True
                                                 
