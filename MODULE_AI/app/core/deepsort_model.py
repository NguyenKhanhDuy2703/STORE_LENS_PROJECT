# tạo phương thức của depsort model
from deep_sort_realtime.deepsort_tracker import DeepSort


class DeepSortModel:
    def __init__(self , config):
        deepsort_config = config['deepsort']
        self.model = DeepSort(
            max_age=deepsort_config['max_age'],
            n_init=deepsort_config['n_init'],
            max_cosine_distance=deepsort_config['max_cosine_distance'],
            nn_budget=deepsort_config['nn_budget']
        )
    def tracker_predict(self , detections , frame):
        tracks = self.model.update_tracks(detections, frame=frame) 
        return tracks
        