const heatmapModel = require("../schemas/heatmap.schema");
const heatmapWorker = {
  async save(data) {
    try {
      const heatmapData = new heatmapModel({
        location_id: 1,
        camera_id: 1,
        date: new Date(),
        time_stamp: Date.now(),
        frame_height: data.frame_height,
        frame_width: data.frame_width,
        grid_size: data.grid_size,
        height_matrix: data.height_matrix,
        width_matrix: data.width_matrix,
        heatmap_matrix: data.heatmap_matrix,
      });
      console.log("Saving heatmap data:", heatmapData);
    } catch (error) {
      logger.error(`Error saving heatmap data: ${error.message}`);
    }
  },
};
module.exports = heatmapWorker;
