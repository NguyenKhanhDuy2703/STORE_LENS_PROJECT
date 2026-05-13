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
        self.old_total_in_store = -1
        self.re_id = Re_ID()

    def _preprocess_frame(self, frame, target_size=(640, 640), pad_value=114):
        if frame is None:
            return None, None

        target_w, target_h = target_size
        frame_h, frame_w = frame.shape[:2]
        if frame_w == 0 or frame_h == 0:
            return None, None

        scale = min(target_w / frame_w, target_h / frame_h)
        new_w = max(1, int(frame_w * scale))
        new_h = max(1, int(frame_h * scale))

        resized = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
        pad_w = target_w - new_w
        pad_h = target_h - new_h
        pad_left = pad_w // 2
        pad_right = pad_w - pad_left
        pad_top = pad_h // 2
        pad_bottom = pad_h - pad_top

        processed = cv2.copyMakeBorder(
            resized,
            pad_top,
            pad_bottom,
            pad_left,
            pad_right,
            borderType=cv2.BORDER_CONSTANT,
            value=(pad_value, pad_value, pad_value),
        )

        meta = {
            "original_w": frame_w,
            "original_h": frame_h,
            "target_w": target_w,
            "target_h": target_h,
            "scale": scale,
            "pad_left": pad_left,
            "pad_top": pad_top,
        }
        return processed, meta

    def _map_zone_points_to_letterbox(self, list_zone, meta):
        if not list_zone or not meta:
            return list_zone

        original_w = meta["original_w"]
        original_h = meta["original_h"]
        scale = meta["scale"]
        pad_left = meta["pad_left"]
        pad_top = meta["pad_top"]

        mapped_zones = []
        for zone in list_zone:
            points = zone.get("points") if isinstance(zone, dict) else getattr(zone, "points", None)
            zone_id = zone.get("zone_id", "unknown") if isinstance(zone, dict) else getattr(zone, "zone_id", "unknown")
            if not points:
                mapped_zones.append({"zone_id": zone_id, "points": []})
                continue

            flat = [v for pair in points for v in pair]
            is_normalized = all(0.0 <= v <= 1.0 for v in flat)
            mapped_points = []
            for x, y in points:
                px = x * original_w if is_normalized else x
                py = y * original_h if is_normalized else y
                mapped_points.append([
                    int(px * scale + pad_left),
                    int(py * scale + pad_top),
                ])

            mapped_zones.append({"zone_id": zone_id, "points": mapped_points})
        return mapped_zones
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
                processed_frame, _ = self._preprocess_frame(frame)
                if processed_frame is None:
                    continue

                self.frame_queue.append(processed_frame)

        except Exception as e:
            raise Exception(f"Error reading stream {input_source}: {str(e)}")
        finally:
            cap.release()
            stop_event.set()
    def draw_tracks( self , frame, tracks):
        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = getattr(track, 'final_track_id', track.track_id)
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


   
    def process_stream(self, url_rtsp , list_zone , camera_id , location_id , stop_event : threading.Event ): 
        try:
            self.object_tracker = object_tracking.ObjectTracking({
            "yolov8_config_path": yolo_model_path,
            "deepsort_config_path": deepsort_model_path
               })
            self.dwell_time_analyzer = DwellTimeAnalysis(iou_threshold=0.7 , time_threshold=3.0)
            self.frame_queue.clear()
            self.redis_publisher = RedisPublisher()
            self.camera_id = camera_id
            cap = cv2.VideoCapture(url_rtsp)
            if not cap.isOpened():
               raise ValueError(f"Failed to open stream: {url_rtsp}")
            
            ret_first, frame_first = cap.read()
            if not ret_first:
                raise ValueError(f"Failed to read first frame: {url_rtsp}")
            processed_first, meta = self._preprocess_frame(frame_first)
            if processed_first is None or meta is None:
                raise ValueError(f"Failed to preprocess first frame: {url_rtsp}")

            frame_h, frame_w = processed_first.shape[0], processed_first.shape[1]
            self.heatmap_analysis = heatmap_analysis.HeatmapAnalysis(frame_w, frame_h)
            list_zone_letterbox = self._map_zone_points_to_letterbox(list_zone, meta)
            self.letterbox_meta = meta

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
                        z_id = z.get("zone_id") if isinstance(z, dict) else getattr(z, "zone_id", "unknown")
                        current_frame_counts[z_id] = 0

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
                        track.final_track_id = final_track_id
                        self.dwell_time_analyzer.update_dwell_time(final_track_id, current_pos = [x1, y1, x2, y2] )
                        
                        center = (x1 + x2) // 2
                        foot = y2
                        hit_zone , zone_event = self.zone_analyzer.analyze(
                            point=(center, foot),
                            list_zones=list_zone_letterbox,
                            track_id=final_track_id,
                            frame_w=frame_w,
                            frame_h=frame_h,
                        )
                        # Lưu zone_id của đúng track vào dwell_times để finalize_stop_event dùng
                        if final_track_id in self.dwell_time_analyzer.dwell_times:
                            self.dwell_time_analyzer.dwell_times[final_track_id]["current_zone"] = hit_zone[0] if hit_zone else None
                        for zone in current_frame_counts.keys():
                            if zone in hit_zone:
                                current_frame_counts[zone] += 1
                        if zone_event:
                            for event in zone_event:
                                self.pack_communication.dispatch_payload(
                                    [
                                        {
                                            "type":"zone_analysis_event",
                                            "data": event,
                                            "info":{
                                                "camera_id": self.camera_id,
                                                "location_id": location_id
                                            }
                                        }
                                    ]
                                )
                        self.heatmap_analysis.update_grid_cell(center, foot)
                        real_time_dwell_events = self.dwell_time_analyzer.alert_stopped_objects(
                            final_track_id,
                            zone_id=hit_zone[0] if hit_zone else None
                        )
                        if real_time_dwell_events:
                            self.pack_communication.dispatch_payload(
                                [
                                    {
                                        "type":"dwell_time_realtime",
                                        "data": real_time_dwell_events,
                                        "info":{
                                            "camera_id": self.camera_id,
                                            "location_id": location_id
                                        }
                                    }
                                ]
                            )
                frame = self.draw_tracks(frame, tracks)
                heatmap_visualizer_instance = heatmap_visualizer.HeatmapVisualizer().draw_grid(frame.copy(), self.heatmap_analysis.grid_size)
                heatmap_overlay = heatmap_visualizer.HeatmapVisualizer().apply_heatmap_overlay(heatmap_visualizer_instance, self.heatmap_analysis.heatmap_matrix, self.heatmap_analysis.grid_size)
                # Tổng số người thực sự trong cửa hàng = tất cả track confirmed
                # (bao gồm cả người không đứng trong zone nào)
                total_in_store = sum(1 for t in tracks if t.is_confirmed())

                zone_payload = {
                    "zone_counts": current_frame_counts,
                    "total_in_store": total_in_store,
                }

                # Publish khi zone_counts HOẶC total_in_store thay đổi
                if self.old_current_frame_counts != current_frame_counts or self.old_total_in_store != total_in_store:
                    self.old_current_frame_counts = current_frame_counts
                    self.old_total_in_store = total_in_store
                    self.pack_communication.dispatch_payload(
                        [
                            {
                                "type":"zone_analysis",
                                "data": zone_payload,
                                "info":{
                                    "camera_id": self.camera_id,
                                    "location_id": location_id
                                }
                            }
                        ]
                    )
                if len(self.dwell_time_analyzer.finished_events) > 0:
                    self.pack_communication.dispatch_payload(
                    [
                        {
                            "type":"dwell_time",
                            "data": list(self.dwell_time_analyzer.finished_events),  # copy trước khi clear
                            "info":{
                                "camera_id": self.camera_id,
                                "location_id": location_id
                            }
                        }
                    ]
                )
                    self.dwell_time_analyzer.finished_events.clear()
                self.dwell_time_analyzer.cleanup_old_tracks()
                
                heatmap_payload = self.heatmap_analysis.get_payload_heatmap()
                if self.letterbox_meta is not None:
                    heatmap_payload["letterbox"] = self.letterbox_meta

                self.pack_communication.dispatch_payload(
                    [ {
                            "type":"heatmap",
                            "data": heatmap_payload,
                            "info":{
                                "camera_id": self.camera_id,
                                "location_id": location_id
                            }
                        }]
                )
                if list_zone_letterbox is not None:
                    heatmap_overlay = self.zone_analyzer.draw_zones(heatmap_overlay, list_zone_letterbox, frame_w, frame_h)
                cv2.imshow(windown_name, heatmap_overlay)
                
                if cv2.waitKey(25) & 0xFF == ord('q'):
                    stop_event.set()
                    break
        except Exception as e:
            logging.exception(f"Critical error in process_stream")
            raise Exception(f"Error processing stream {url_rtsp}: {str(e)}")            
        finally:
            # Flush data còn lại trước khi shutdown (tránh mất data người đứng yên đến cuối video)
            self.dwell_time_analyzer.flush_all_active()
            if len(self.dwell_time_analyzer.finished_events) > 0:
                self.pack_communication.dispatch_payload(
                    [{
                        "type": "dwell_time",
                        "data": list(self.dwell_time_analyzer.finished_events),
                        "info": {
                            "camera_id": self.camera_id,
                            "location_id": location_id
                        }
                    }]
                )
                self.dwell_time_analyzer.finished_events.clear()
            stop_event.set()
            for _ in range(5):
                cv2.waitKey(1)
            cv2.destroyAllWindows()
    def stop(self , stop_event : threading.Event):
        stop_event.set() 
        return True
                                                 
