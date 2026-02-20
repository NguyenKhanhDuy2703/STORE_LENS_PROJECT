from .yolov8_model import YOLOv8Model
from .deepsort_model import DeepSortModel
from ..config import settings_dev
class ObjectTracking :
    def __init__(self , config):
        self.yolo_model = YOLOv8Model(config["yolov8_config_path"])
        self.deepsort_model = DeepSortModel(config["deepsort_config_path"])
    def tranform_detections(self, results):
        detections = []
        for result in results:
            for box in result.boxes:
  
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = box.conf[0].item()
                cls = int(box.cls[0].item()) 
                w = x2 - x1
                h = y2 - y1
                detections.append(([x1, y1, w, h], conf, cls))
        return detections
    def process_signle_frame(self , frame):
        results = self.yolo_model.predict_frame(frame)
        detections = self.tranform_detections(results)
        tracks = self.deepsort_model.tracker_predict(detections, frame = frame)
        return tracks
    