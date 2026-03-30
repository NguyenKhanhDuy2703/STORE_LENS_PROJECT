import numpy as np
import cv2

class ZoneAnalysis:
    def __init__(self):
        self.status_person_run = {}

    def pointpolygon(self, point, polygon_points):
        pt = (float(point[0]), float(point[1]))    
        contour = np.array(polygon_points, dtype=np.int32).reshape((-1, 1, 2)) 
        return cv2.pointPolygonTest(contour, pt, False) >= 0

    def analyze(self, point, list_zones, track_id=None):
        hit_zones = []
        events = [] 
        if not list_zones or track_id is None:
            return hit_zones, events

        current_zone_name = "OUTSIDE"
        for zone in list_zones:
            points = zone.get("points") if isinstance(zone, dict) else getattr(zone, "points", None)
            name = zone.get("name", "unknown") if isinstance(zone, dict) else getattr(zone, "name", "unknown")
            
            if points and self.pointpolygon(point, points):
                current_zone_name = name
                hit_zones.append(name)
                break 
        last_zone_name = self.status_person_run.get(track_id, "OUTSIDE")

        if current_zone_name != last_zone_name:
            if last_zone_name == "OUTSIDE" and current_zone_name != "OUTSIDE":
                events.append({"track_id": track_id, "zone": current_zone_name, "event": "ENTRY"})
            elif last_zone_name != "OUTSIDE" and current_zone_name == "OUTSIDE":
                events.append({"track_id": track_id, "zone": last_zone_name, "event": "EXIT"})
            elif last_zone_name != "OUTSIDE" and current_zone_name != "OUTSIDE":
                events.append({"track_id": track_id, "from": last_zone_name, "to": current_zone_name, "event": "TRANSITION"})
            self.status_person_run[track_id] = current_zone_name

        return hit_zones, events
    def cleanup_event_person_zone(self , track_id):
        if track_id in self.status_person_run:
            del self.status_person_run[track_id]
    def draw_zones(self, frame, list_zones):
        if list_zones is None or frame is None: return frame
        for zone in list_zones:
            points = zone.get("points") if isinstance(zone, dict) else getattr(zone, "points", None)
            name = zone.get("name", "unknown") if isinstance(zone, dict) else getattr(zone, "name", "unknown")
            if not points: continue
            contour = np.array(points, dtype=np.int32).reshape((-1, 1, 2))
            cv2.polylines(frame, [contour], isClosed=True, color=(255, 255, 0), thickness=2)
            cv2.putText(frame, name, (int(contour[0][0][0]), int(contour[0][0][1]) - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        return frame