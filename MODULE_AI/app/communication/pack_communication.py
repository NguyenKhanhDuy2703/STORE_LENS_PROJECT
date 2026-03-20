import time
from app.communication.redis_publish import RedisPublisher
class PackCommunication:
    def __init__(self):
        self.time_send_payload = {
            "tracking": 10.0,
            "dwell_time": 0,
            "heatmap": 10.0,
            "zone_analysis": 1.0
        }
        self.last_sent = {
                "heatmap": time.time(),
                "zone_analysis": time.time(),
                "tracking": time.time(),
            }
        self.current_tracking = {}
        self.redis_publisher = RedisPublisher()
    
    def dispatch_payload(self , payload_data):
        now = time.time()
        for data in payload_data:
            match data["type"]:
                case "tracking":
                    pass
                case "dwell_time":
                    self.redis_publisher.publish("dwell_time_channel", data["data"])
                case "heatmap":
                    if now - self.last_sent["heatmap"] >= self.time_send_payload["heatmap"]:
                        self.redis_publisher.publish("heatmap_channel", data["data"]())
                        self.last_sent["heatmap"] = now
                    pass
                case "zone_analysis":
                    if now - self.last_sent["zone_analysis"] >= self.time_send_payload["zone_analysis"]:
                        self.redis_publisher.publish("zone_analysis_channel", data["data"])
                        self.last_sent["zone_analysis"] = now
                case _:
                    pass