const heatmapSechma = require("../schemas/heatmap.schema");
const { dateUtil } = require("../utils/date.util");
const cameraSchema = require("../schemas/camera.schema");
const heatmapService = {
  async get({ locationId, cameraId, type, startCustom, endCustom, date }) {
    const filterType = type || (date ? "custom" : "today");
    const customStart = startCustom || date;
    const customEnd = endCustom || date;
    const { startDate, endDate } = dateUtil({
      type: filterType,
      startCustom: customStart,
      endCustom: customEnd,
    });

    const heatmapData = await heatmapSechma.find({
      location_id: locationId,
      camera_id: cameraId,
      date: { $gte: startDate, $lte: endDate },
    }, {
      _id: 0,
    }).sort({ time_stamp: 1 });

    if (!heatmapData || heatmapData.length === 0) {
      return null;
    }

    const url_image_snapshot = await cameraSchema.findOne(
      {
        location_id: locationId,
        camera_code: cameraId,
      },
      {
        _id: 0,
        url_image_snapshot: 1,
      }
    );

    return {
      heatmapData,
      url_image_snapshot: url_image_snapshot ? url_image_snapshot.url_image_snapshot : null,
    };
  },
};
module.exports = heatmapService;
