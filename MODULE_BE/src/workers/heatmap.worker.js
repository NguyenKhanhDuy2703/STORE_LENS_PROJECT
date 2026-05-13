const heatmapModel = require("../schemas/heatmap.schema");
const logger = require("../utils/logging");
const TIME_THRESHOLD = 20 * 1000; // 20 seconds
const LIST_TIME_STAMP = new Map();
const {getCurrnetDateVN} = require("../utils/date.util");
const heatmapWorker = {
  async save(payload) {
    const {data , infor} = payload;
    const currentTime = Date.now();
   
    if(!LIST_TIME_STAMP.has(`${infor.location_id}_${infor.camera_id}`)){
        // Khởi tạo là 0 để frame đầu tiên luôn được lưu ngay lập tức
        LIST_TIME_STAMP.set(`${infor.location_id}_${infor.camera_id}`, 0);
    }
    const lastTime = LIST_TIME_STAMP.get(`${infor.location_id}_${infor.camera_id}`);
    
    try {
      if (currentTime - lastTime >= TIME_THRESHOLD) {
          const heatmapData = new heatmapModel({
            location_id: infor.location_id,
            camera_id: infor.camera_id,
            date: getCurrnetDateVN(),
            frame_height: data.frame_height,
            frame_width: data.frame_width,
            grid_size: data.grid_size,
            height_matrix: data.grid_width,
            width_matrix: data.grid_height,
            heatmap_matrix: data.heatmap_matrix,
            time_stamp: currentTime
          });

          await heatmapData.save();
          // Chỉ cập nhật lại mốc thời gian sau khi đã ghi thành công
          LIST_TIME_STAMP.set(`${infor.location_id}_${infor.camera_id}`, currentTime);
      }
      // Bỏ nhánh else: Nếu chưa đủ 20s, đơn giản là drop (bỏ qua) frame này để tiết kiệm DB write.
    } catch (error) {
      logger.error(`Error saving heatmap data: ${error.message}`);
    }
  },
};
module.exports = heatmapWorker;
