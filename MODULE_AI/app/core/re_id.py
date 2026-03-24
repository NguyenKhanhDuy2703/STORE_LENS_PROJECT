from app.core.redis import redis_client
import numpy as np
from scipy.spatial.distance import cosine


class Re_ID:
    def __init__(self):
        self.redis_client = redis_client
        self.threshold = 0.12

    def store_re_id_feature(self, track_id, re_id_feature):
        try:
            if isinstance(re_id_feature, list):
                re_id_feature = np.array(re_id_feature, dtype=np.float32)
            elif not isinstance(re_id_feature, np.ndarray):
                re_id_feature = np.array(re_id_feature, dtype=np.float32)
            
            if re_id_feature.dtype != np.float32:
                re_id_feature = re_id_feature.astype(np.float32)
            
            self.redis_client.set(
                f"re_id_feature:{track_id}",
                re_id_feature.tobytes()
            )
   
        except Exception as e:
            raise Exception(f"Error storing re-ID feature in Redis: {str(e)}")

    def check_mapping_re_id(self, current_re_id_feature):
        try:
            if isinstance(current_re_id_feature, list):
                current_re_id_feature = np.array(current_re_id_feature, dtype=np.float32)
            elif not isinstance(current_re_id_feature, np.ndarray):
                current_re_id_feature = np.array(current_re_id_feature, dtype=np.float32)
            
            if current_re_id_feature.dtype != np.float32:
                current_re_id_feature = current_re_id_feature.astype(np.float32)
            
            all_re_id_keys = self.redis_client.keys("re_id_feature:*")
            print(f"Checking re-ID features against {len(all_re_id_keys)} stored features.")
            
            for key in all_re_id_keys:
                store_feature_bytes = self.redis_client.get(key)
                
                if store_feature_bytes is not None:
                    # Convert raw bytes back to numpy array
                    store_feature = np.frombuffer(store_feature_bytes, dtype=np.float32)
                    
                    # Validate shape compatibility before distance calculation
                    if current_re_id_feature.shape != store_feature.shape:
                        print(f"Shape mismatch for key {key}: expected {current_re_id_feature.shape}, got {store_feature.shape}. Skipping.")
                        continue
                    
                    # Calculate cosine distance
                    distance = cosine(current_re_id_feature, store_feature)
                    if distance < self.threshold:
                        track_id = key.decode('utf-8').split(":")[1]
                        return True, track_id
            
            return False, None
            
        except Exception as e:
            raise Exception(f"Error retrieving re-ID feature from Redis: {str(e)}")