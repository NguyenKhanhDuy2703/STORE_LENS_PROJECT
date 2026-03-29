import time
from app.communication.redis_publish import RedisPublisher
class PackCommunication:
    def __init__(self):
        self.time_send_payload = {
            "tracking": 10.0,
            "dwell_time": 10.0,
            "heatmap": 20.0,
            "zone_analysis": 1.0,
            "zone_analysis_event": 10.0,
        }
        self.last_sent = {
                "heatmap": time.time(),
                "zone_analysis": time.time(),
                "tracking": time.time(),
                "zone_analysis_event": time.time(),
                "dwell_time": time.time(),
            }
        self.current_tracking = {}
        self.redis_publisher = RedisPublisher()
        self.event_person_in_zone = {}
    
    def dispatch_payload(self , payload_data):
        now = time.time()
        for data in payload_data:
            match data["type"]:
                case "tracking":
                    pass
                case "dwell_time":
                    if now - self.last_sent["dwell_time"] >= self.time_send_payload["dwell_time"]:
                        self.redis_publisher.publish("dwell_time_channel", message= {"data": data["data"] ,"infor": data["info"]})
                        self.last_sent["dwell_time"] = now
                case "heatmap":
                    if now - self.last_sent["heatmap"] >= self.time_send_payload["heatmap"]:
                        self.redis_publisher.publish("heatmap_channel", message= {"data": data["data"]() ,"infor": data["info"]})
                        self.last_sent["heatmap"] = now
                case "zone_analysis":
                    if now - self.last_sent["zone_analysis"] >= self.time_send_payload["zone_analysis"]:
                        self.redis_publisher.publish("zone_analysis_channel", message= {"data": data["data"] ,"infor": data["info"]})
                case "zone_analysis_event":
                    if now - self.last_sent["zone_analysis_event"] >= self.time_send_payload["zone_analysis_event"]:
                        self.redis_publisher.publish("zone_analysis_event_channel", message= {"data": data["data"] ,"infor": data["info"]})
                        self.last_sent["zone_analysis_event"] = now
                case "dwell_time_realtime":
                    self.redis_publisher.publish("dwell_time_realtime_channel",message= {"data": data["data"] ,"infor": data["info"]})
                case _:
                    pass