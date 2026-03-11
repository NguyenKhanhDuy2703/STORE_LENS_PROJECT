from ..core import object_tracking
from ..config import settings_dev
from collections import deque
import cv2
import threading
import logging
import time
from app.analytics import heatmap_analysis 
from app.utils import heatmap_visualizer
from app.analytics.dwelltime_analysis import DwellTimeAnalysis
from app.communication.redis_publish import RedisPublisher
yolo_model_path = settings_dev.read_yaml_config(settings_dev.YOLOV8_CONFIG_PATH)
deepsort_model_path = settings_dev.read_yaml_config(settings_dev.DEEPSORT_CONFIG_PATH)
source_video = settings_dev.VIDEO_SOURCE
class StreamProcessor:
    
    def __init__(self):
        self.frame_queue = deque(maxlen=50)
        self.heatmap_analysis = None
    def _read_frames(self, url_rtsp , stop_event : threading.Event):

        input_source = source_video if url_rtsp.split("-")[0] == 'test' else url_rtsp
        cap = cv2.VideoCapture(input_source)
        
        if not cap.isOpened():
            raise ValueError(f"Failed to open stream: {input_source}")      
        try:
            while not stop_event.is_set():
                if len(self.frame_queue) >= 50:
                    time.sleep(0.01) 
                    continue

                ret, frame = cap.read()
                if not ret:
                    break
                
                self.frame_queue.append(frame)
        except Exception as e:
            raise Exception(f"Error reading stream {input_source}: {str(e)}")
        finally:
            cap.release()
            stop_event.set()
    def draw_tracks( self , frame, tracks):
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
    def process_stream(self, url_rtsp , stop_event : threading.Event): 
        try:
            self.object_tracker = object_tracking.ObjectTracking({
            "yolov8_config_path": yolo_model_path,
            "deepsort_config_path": deepsort_model_path
               })
            self.dwell_time_analyzer = DwellTimeAnalysis(iou_threshold=0.5)
            self.frame_queue.clear()
            self.redis_publisher = RedisPublisher()
            cap = cv2.VideoCapture(url_rtsp)
            if not cap.isOpened():
               raise ValueError(f"Failed to open stream: {url_rtsp}")
            
            ret_first, frame_first = cap.read()
            self.heatmap_analysis = heatmap_analysis.HeatmapAnalysis(frame_first.shape[1], frame_first.shape[0])

            windown_name = f"AI Tracking - {url_rtsp}"
            read_thread = threading.Thread(target=self._read_frames, args=(url_rtsp,stop_event))
            read_thread.daemon = True
            read_thread.start()
           

            time.sleep(1) 
            while not stop_event.is_set():
                if len(self.frame_queue) == 0:
                    time.sleep(0.01)
                    continue
                
                frame = self.frame_queue.popleft()
                tracks = self.object_tracker.process_single_frame(frame)
                
                frame = self.draw_tracks(frame, tracks)
                for track in tracks:
                    if track.is_confirmed():
                        x1, y1, x2, y2 = map(int, track.to_ltrb())
                        self.dwell_time_analyzer.update_dwell_time(track.track_id, current_pos = [x1, y1, x2, y2])
                        center = (x1 + x2) // 2
                        foot = y2
                        self.redis_publisher.publish("tracking_data", {
                            "track_id": track.track_id,
                            "x": center,
                            "y": foot,
                        })
                        self.heatmap_analysis.update_grid_cell(center, foot)
                heatmap_visualizer_instance = heatmap_visualizer.HeatmapVisualizer().draw_grid(frame.copy(), self.heatmap_analysis.grid_size)
                heatmap_overlay = heatmap_visualizer.HeatmapVisualizer().apply_heatmap_overlay(heatmap_visualizer_instance, self.heatmap_analysis.heatmap_matrix, self.heatmap_analysis.grid_size)
                if self.dwell_time_analyzer.finished_events:
                    print("New stop events:", self.dwell_time_analyzer.get_new_events())
                cv2.imshow(windown_name, heatmap_overlay)
                
                if cv2.waitKey(25) & 0xFF == ord('q'):
                    stop_event.set()
                    break
        except Exception as e:
            logging.exception(f"Critical error in process_stream")
            raise Exception(f"Error processing stream {url_rtsp}: {str(e)}")            
        finally:
            stop_event.set()
            for _ in range(5):
                cv2.waitKey(1)
            cv2.destroyAllWindows()
    def stop(self , stop_event : threading.Event):
        stop_event.set() 
        return True
                                                 
