const heatmapModel = require("../schemas/heatmap.schema");
const logger = require("../utils/logging");
const TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const heatmapWorker = {
  async save(payload) {
    const {data , infor} = payload;
    let timebefore = 0;
    let currentTime = Date.now();
    try {
      const heatmapData = new heatmapModel({
            location_id: infor.location_id,
            camera_id: infor.camera_id,
            date: new Date(),
            frame_height: data.frame_height,
            frame_width: data.frame_width,
            grid_size: data.grid_size,
            height_matrix: data.height_matrix,
            width_matrix: data.width_matrix,
            heatmap_matrix: data.heatmap_matrix,
          });
      if (currentTime - timebefore < TIME_THRESHOLD) {
         heatmapData.time_stamp = currentTime;
         timebefore = currentTime;
         await heatmapData.save();
         logger.info(`Saved heatmap data for camera ${infor.camera_id} at location ${infor.location_id}`);
      }else{
        heatmapData.time_stamp = currentTime;
        timebefore = currentTime;
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
