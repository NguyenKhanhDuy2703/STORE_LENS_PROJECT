const zoneStatsSchema = require("../schemas/zoneStats.schema");
const sessionSchema = require("../schemas/session.schema");
const businessEventSchema = require("../schemas/businessEvent.schema");
const interactionLogSchema = require("../schemas/interactionLog.schema");
const dateUtil = require("../utils/date.util");
const zoneSchema = require("../schemas/zone.schema");
const assetSchema = require("../schemas/asset.schema");

const zoneStatsWorker = {
  async process({ locationId, zoneId, cameraCode }) {
    const { startDate: today, endDate: nextDay } = dateUtil.dateUtil({ type: "today" });

    let resolvedCameraCode = cameraCode;
    if (!resolvedCameraCode) {
      const zone = await zoneSchema.findOne(
        {
          location_id: locationId,
          zone_id: zoneId,
        },
        {
          _id: 0,
          camera_id: 1,
        },
      );
      resolvedCameraCode = zone?.camera_id || null;
    }

    await zoneStatsSchema.updateOne(
      {
        location_id: locationId,
        zone_id: zoneId,
        date: today,
      },
      {
        $set: {
          camera_code: resolvedCameraCode,
        },
        $setOnInsert: {
          location_id: locationId,
          zone_id: zoneId,
          date: today,
          trend: "stable",
          performance: {
            people_count: 0,
            total_sales_value: 0,
            total_events: 0,
            conversion_rate: 0,
            avg_dwell_time: 0,
            total_stop_events: 0,
            top_asset_id: null,
            peak_hour: null,
          },
        },
      },
      {
        upsert: true,
      },
    );
    const results = await Promise.allSettled([
      await this.dataTrackingProcessor({ locationId, zoneId, today, nextDay }),
      await this.revenueProcessor({ locationId, zoneId, today, nextDay }),
    ]);
    await zoneStatsSchema.updateOne(
      {
        location_id: locationId,
        zone_id: zoneId,
        date: today,
      },
      [
        {
          $set: {
            "performance.conversion_rate": {
              $cond: [
                { $gt: ["$performance.people_count", 0] },
                {
                  $multiply: [
                    {
                      $divide: [
                        "$performance.total_events",
                        "$performance.people_count",
                      ],
                    },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
      ],
    );
    for (const result of results) {
      if (result.status === "rejected") {
        throw result.reason;
      }
    }
  },
  async dataTrackingProcessor({ locationId, zoneId, today, nextDay }) {
    const resultsTracking = await Promise.allSettled([
      funcTracking.trackingAgg({ locationId, zoneId, today, nextDay }),
      funcTracking.peakHourAgg({ locationId, zoneId, today, nextDay }),
      funcTracking.totalStopEventsAgg({ locationId, zoneId, today, nextDay }),
    ]);
    const [trackingResult, peakHourResult, totalStopEventsResult] =
      resultsTracking;
    for (const result of resultsTracking) {
      if (result.status === "rejected") {
        throw result.reason;
      }
    }
    const trackingAgg = trackingResult.value || {};
    const peakHourAgg = peakHourResult.value || null;
    const totalStopEventsAgg = totalStopEventsResult.value || 0;
    await zoneStatsSchema.updateOne(
      {
        location_id: locationId,
        zone_id: zoneId,
        date: today,
      },
      {
        $set: {
          "performance.people_count": trackingAgg.people_count || 0,
          "performance.avg_dwell_time": trackingAgg.avg_dwell_time || 0,
          "performance.total_stop_events": totalStopEventsAgg || 0,
          "performance.peak_hour": peakHourAgg || null,
        },
      },
    );
  },
  async revenueProcessor({ locationId, zoneId, today, nextDay }) {
    const categoryNameInZone = await zoneSchema.findOne(
      {
        location_id: locationId,
        zone_id: zoneId,
      },
      {
        _id: 0,
        category_name: 1,
      },
    );

    const assetsInCategory = await assetSchema.find(
      {
        location_id: locationId,
        category_name: categoryNameInZone.category_name,
      },
      {
        _id: 1,
      },
    );
    const assetIds = assetsInCategory.map((asset) => String(asset._id));

    const revenueAgg = await businessEventSchema.aggregate([
      {
        $match: {
          location_id: locationId,
          date: { $gte: today, $lte: nextDay },
        },
      },
      {
        $unwind: "$event_details",
      },
      {
        $match: {
          "event_details.item_id": { $in: assetIds },
        },
      },
      {
        $group: {
          _id: "$event_details.item_id",
          item_name: { $first: "$event_details.item_name" },
          total_sales_value: { $sum: "$event_details.total_price" },
          total_events: { $sum: 1 },
        },
      },
      {
        $sort: {
          total_sales_value: -1,
        },
      },
      {
        $project: {
          _id: 0,
          item_id: "$_id",
          item_name: 1,
          total_sales_value: 1,
          total_events: 1,
        },
      },
    ]);
    const totalSalesValue = revenueAgg.reduce(
      (sum, item) => sum + (item.total_sales_value || 0),
      0,
    );
    const totalEvents = revenueAgg.reduce(
      (sum, item) => sum + (item.total_events || 0),
      0,
    );
    const topAsset = revenueAgg[0] || null;

    await zoneStatsSchema.updateOne(
      {
        location_id: locationId,
        zone_id: zoneId,
        date: today,
      },
      {
        $set: {
          "performance.total_sales_value": totalSalesValue,
          "performance.total_events": totalEvents,
          "performance.top_asset_id": topAsset?.item_id || null,
        },
      },
    );
  },
};

const funcTracking = {
  async trackingAgg({ locationId, zoneId, today, nextDay }) {
    const trackingAgg = await sessionSchema.aggregate([
      {
        // Lọc theo date ngay từ đầu — tránh scan toàn bộ sessions
        $match: {
          location_id: locationId,
          entry_time: { $gte: today, $lte: nextDay },
        },
      },
      { $unwind: "$zone_sequence" },
      {
        // Lọc đúng zone và trong ngày — KHÔNG lọc exit_time
        // để người đang ở trong zone vẫn được tính vào people_count
        $match: {
          "zone_sequence.zone_id": zoneId,
          "zone_sequence.entry_time": { $gte: today, $lte: nextDay },
        },
      },
      {
        // Chuyển dwell_time của entry đang active (exit_time=null) thành null.
        // MongoDB $avg tự bỏ qua null → avg_dwell_time chỉ tính người đã EXIT
        $project: {
          session_id: "$_id",
          dwell_for_avg: {
            $cond: [
              { $ne: ["$zone_sequence.exit_time", null] },
              "$zone_sequence.dwell_time_seconds",
              null,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          // Đếm người duy nhất đã VÀO zone (kể cả đang còn trong zone)
          unique_sessions: { $addToSet: "$session_id" },
          // $avg bỏ qua null → chỉ avg những người đã ra
          avg_dwell_time: { $avg: "$dwell_for_avg" },
        },
      },
      {
        $project: {
          _id: 0,
          zone_id: { $literal: zoneId },
          people_count: { $size: "$unique_sessions" },
          avg_dwell_time: { $ifNull: ["$avg_dwell_time", 0] },
        },
      },
    ]);
    return trackingAgg[0] || {};
  },
  async peakHourAgg({ locationId, zoneId, today, nextDay }) {
    const peakHourAgg = await sessionSchema.aggregate([
      {
        $match: {
          location_id: locationId,
        },
      },
      {
        $unwind: "$zone_sequence",
      },
      {
        $match: {
          "zone_sequence.zone_id": zoneId,
          "zone_sequence.entry_time": { $gte: today, $lte: nextDay },
        },
      },
      {
        $group: {
          _id: {
            $hour: {
              date: "$zone_sequence.entry_time",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
          people_count: { $sum: 1 },
        },
      },
      {
        $sort: { people_count: -1 },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 1,
          zone_id: { $literal: zoneId },
        },
      },
    ]);
    return peakHourAgg[0]?._id || null;
  },
  async totalStopEventsAgg({ locationId, zoneId, today, nextDay }) {
    // Đếm từ interactionLog — mỗi document = 1 lượt AI xác nhận người đứng yên ≥ 2s
    // Chỉ ghi khi zone có asset_id; zone không có asset sẽ trả về 0
    const total = await interactionLogSchema.countDocuments({
      location_id: locationId,
      zone_id: zoneId,
      event_type: "stop",
      start_time: { $gte: today, $lte: nextDay },
    });
    return total;
  },
};
module.exports = zoneStatsWorker;
