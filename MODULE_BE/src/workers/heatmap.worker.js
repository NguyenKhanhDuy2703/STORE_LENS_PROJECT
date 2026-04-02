const heatmapModel = require("../schemas/heatmap.schema");
const logger = require("../utils/logging");
const TIME_THRESHOLD = 20 * 1000; // 20 seconds
const LIST_TIME_STAMP = new Map();
const heatmapWorker = {
  async save(payload) {
    const {data , infor} = payload;
    const currentTime = Date.now();
   
    if(!LIST_TIME_STAMP.has(`${infor.location_id}_${infor.camera_id}`)){
        LIST_TIME_STAMP.set(`${infor.location_id}_${infor.camera_id}`, currentTime);
    }
    const lastTime = LIST_TIME_STAMP.get(`${infor.location_id}_${infor.camera_id}`);
    try {
      const heatmapData = new heatmapModel({
            location_id: infor.location_id,
            camera_id: infor.camera_id,
            date: new Date(),
            frame_height: data.frame_height,
            frame_width: data.frame_width,
            grid_size: data.grid_size,
            height_matrix: data.grid_width,
            width_matrix: data.grid_height,
            heatmap_matrix: data.heatmap_matrix,
          });
      if (currentTime - lastTime >= TIME_THRESHOLD) {
         heatmapData.time_stamp = currentTime;
         LIST_TIME_STAMP.set(`${infor.location_id}_${infor.camera_id}`, currentTime);
         await heatmapData.save();
      }else{
        heatmapData.time_stamp = currentTime;
        LIST_TIME_STAMP.set(`${infor.location_id}_${infor.camera_id}`, currentTime);
        await heatmapData.updateOne(
          { 
            location_id: infor.location_id, 
            camera_id: infor.camera_id 
          }, 
          heatmapData, { upsert: true });
      }
    } catch (error) {
      logger.error(`Error saving heatmap data: ${error.message}`);
    }
  },
};
module.exports = heatmapWorker;
