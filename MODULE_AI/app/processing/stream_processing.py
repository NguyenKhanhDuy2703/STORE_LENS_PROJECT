from ..core import object_tracking
from ..config import settings_dev
from collections import deque
import cv2
import threading
import logging
import time
import numpy as np
from app.analytics import heatmap_analysis 
from app.utils import heatmap_visualizer
from app.analytics.dwelltime_analysis import DwellTimeAnalysis
from app.communication.redis_publish import RedisPublisher
from app.analytics.zone_analysis import ZoneAnalysis
from app.communication.pack_communication import PackCommunication
from app.core.re_id import Re_ID
yolo_model_path = settings_dev.read_yaml_config(settings_dev.YOLOV8_CONFIG_PATH)
deepsort_model_path = settings_dev.read_yaml_config(settings_dev.DEEPSORT_CONFIG_PATH)
source_video = settings_dev.VIDEO_SOURCE
class StreamProcessor:
    
    def __init__(self):
        self.frame_queue = deque(maxlen=50)
        self.heatmap_analysis = None
        self.zone_analyzer = ZoneAnalysis()
        self.pack_communication = PackCommunication()
        self.old_current_frame_counts = {}
        self.re_id = Re_ID()
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


   
    def process_stream(self, url_rtsp , list_zone , stop_event : threading.Event ): 
        try:
            self.object_tracker = object_tracking.ObjectTracking({
            "yolov8_config_path": yolo_model_path,
            "deepsort_config_path": deepsort_model_path
               })
            self.dwell_time_analyzer = DwellTimeAnalysis(iou_threshold=0.7 , time_threshold=3.0)
            self.frame_queue.clear()
            self.redis_publisher = RedisPublisher()
            self.camera_id = url_rtsp.split("-")[1] if url_rtsp.split("-")[0] == 'test' else url_rtsp
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
                
                
                current_frame_counts = {}
                if list_zone:
                    for z in list_zone:
                        z_name = z.get("name") if isinstance(z, dict) else getattr(z, "name", "unknown")
                        current_frame_counts[z_name] = 0

                for track in tracks:
                    if track.is_confirmed():
                        x1, y1, x2, y2 = map(int, track.to_ltrb())
                        deepsort_track_id = str(track.track_id)
                        re_id_feature_info = []
                        final_track_id = self.re_id.get_id_mapping(camera_id=self.camera_id, deepsort_id=deepsort_track_id)
                        if final_track_id is None:
                        # kiem ta co feature trong dpsort ko
                            if hasattr(track , "features") and track.features is not None:
                                re_id_feature_info = np.mean(track.features, axis=0).tolist()
                                status_check , matched_id  = self.re_id.check_mapping_re_id(re_id_feature_info, camera_id=self.camera_id)
                                if status_check :
                                    final_track_id = matched_id
                                    self.re_id.set_id_mapping(camera_id=self.camera_id , deepsort_id=deepsort_track_id, final_id=final_track_id)
                                else:
                                    final_track_id = deepsort_track_id
                                    self.re_id.store_re_id_feature(final_id=deepsort_track_id, feature_vector=re_id_feature_info, camera_id=self.camera_id)
                                    self.re_id.set_id_mapping(camera_id=self.camera_id , deepsort_id=deepsort_track_id, final_id=final_track_id)
                            else:
                                final_track_id = deepsort_track_id
                                self.re_id.set_id_mapping(camera_id=self.camera_id, deepsort_id=deepsort_track_id, final_id=final_track_id)
                                               
                        final_track_id = final_track_id or deepsort_track_id
                        track.track_id = final_track_id
                        self.dwell_time_analyzer.update_dwell_time(final_track_id, current_pos = [x1, y1, x2, y2] )
                        
                        center = (x1 + x2) // 2
                        foot = y2
                        hit_zone , zone_event = self.zone_analyzer.analyze(point=(center, foot), list_zones = list_zone , track_id = final_track_id)
                        for zone in current_frame_counts.keys():
                            if zone in hit_zone:
                                current_frame_counts[zone] += 1
                        if zone_event:
                            for event in zone_event:
                                self.pack_communication.dispatch_payload(
                                    [
                                        {
                                            "type":"zone_analysis_event",
                                            "data": event
                                        }
                                    ]
                                )
                        self.heatmap_analysis.update_grid_cell(center, foot)
                        real_time_dwell_events = self.dwell_time_analyzer.alert_stopped_objects(final_track_id)
                        if real_time_dwell_events:
                            self.pack_communication.dispatch_payload(
                                [
                                    {
                                        "type":"dwell_time_realtime",
                                        "data": real_time_dwell_events
                                    }
                                ]
                            )
                frame = self.draw_tracks(frame, tracks)
                heatmap_visualizer_instance = heatmap_visualizer.HeatmapVisualizer().draw_grid(frame.copy(), self.heatmap_analysis.grid_size)
                heatmap_overlay = heatmap_visualizer.HeatmapVisualizer().apply_heatmap_overlay(heatmap_visualizer_instance, self.heatmap_analysis.heatmap_matrix, self.heatmap_analysis.grid_size)
                if self.old_current_frame_counts != current_frame_counts:
                    self.old_current_frame_counts = current_frame_counts
                    self.pack_communication.dispatch_payload(
                        [
                            {
                                "type":"zone_analysis",
                                "data": current_frame_counts
                            }
                        ]
                    )
                if len(self.dwell_time_analyzer.finished_events) > 0:
                    self.pack_communication.dispatch_payload(
                    [
                        {
                            "type":"dwell_time",
                            "data": self.dwell_time_analyzer.finished_events
                        }
                    ]
                )
                self.dwell_time_analyzer.cleanup_old_tracks()
                
                self.pack_communication.dispatch_payload(
                    [ {
                            "type":"heatmap",
                            "data": self.heatmap_analysis.get_payload_heatmap
                        }]
                )
                if list_zone is not None:
                    heatmap_overlay = self.zone_analyzer.draw_zones(heatmap_overlay, list_zone)
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
                                                 
