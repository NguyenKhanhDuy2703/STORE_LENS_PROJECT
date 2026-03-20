import numpy as np
import cv2

class ZoneAnalysis:
    def __init__(self):
        pass
    def pointpolygon(self, point, polygon_points):
        pt = (float(point[0]), float(point[1]))    
        contour = np.array(polygon_points, dtype=np.int32)
        contour = contour.reshape((-1, 1, 2)) 
    
        return cv2.pointPolygonTest(contour, pt, False) >= 0

    def analyze(self, point, list_zones):
        hit_zones = []
        if not list_zones:
            return hit_zones

        for zone in list_zones:
            if isinstance(zone, dict):
                points = zone.get("points")
                name = zone.get("name", "unknown")
            else:
                points = getattr(zone, "points", None)
                name = getattr(zone, "name", "unknown")
            if not points:
                continue
            if self.pointpolygon(point, points):
                hit_zones.append(name)

        return hit_zones

    def draw_zones(self, frame, list_zones):
        """Vẽ viền Cyan lên hình để debug"""
        if list_zones is None or frame is None:
            return frame

        for zone in list_zones:
            if isinstance(zone, dict):
                points = zone.get("points")
                name = zone.get("name", "unknown")
            else:
                points = getattr(zone, "points", None)
                name = getattr(zone, "name", "unknown")

            if not points:
                continue

            contour = np.array(points, dtype=np.int32)
            contour = contour.reshape((-1, 1, 2)) 
            
            cv2.polylines(frame, [contour], isClosed=True, color=(255, 255, 0), thickness=2)
            
            # Ghi tên Zone
            x = int(contour[0][0][0])
            y = int(contour[0][0][1])
            text_pos = (x, y - 10)
            
            cv2.putText(frame, name, text_pos, cv2.FONT_HERSHEY_SIMPLEX, 
                        0.6, (255, 255, 0), 2, cv2.LINE_AA)
            
        return frame