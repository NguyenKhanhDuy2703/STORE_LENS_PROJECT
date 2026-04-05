const zoneStatsSchema = require("../schemas/zoneStats.schema");
const sessionSchema = require("../schemas/session.schema");
const businessEventSchema = require("../schemas/businessEvent.schema");
const interactionLogSchema = require("../schemas/interactionLog.schema");
const dateUtil = require("../utils/date.util");
const zoneSchema = require("../schemas/zone.schema");
const assetSchema = require("../schemas/asset.schema");

const zoneStatsWorker = {
  async process({ locationId, zoneId }) {
    const today = dateUtil.getVNStartofDay(new Date());
    const nextDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    await zoneStatsSchema.updateOne(
      {
        location_id: locationId,
        zone_id: zoneId,
        date: today,
      },
      {
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
                { $gt: ["$performance.people_count", 0] }, // điều kiện: nếu people_count > 0
                {
                  $multiply: [
                    {
                      $divide: [
                        "$performance.people_count",
                        "$performance.total_sales_value",
                      ],
                    },
                    100,
                  ],
                }, // nếu điều kiện đúng: tính conversion_rate = total_sales_value / people_count
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
          date: { $gte: today, $lt: nextDay },
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
          "zone_sequence.entry_time": { $gte: today, $lt: nextDay },
        },
      },
      {
        $group: {
          _id: null,
          people_count: { $sum: 1 },
          avg_dwell_time: { $avg: "$zone_sequence.dwell_time_seconds" },
        },
      },
      {
        $project: {
          _id: 0,
          zone_id: { $literal: zoneId },
          people_count: 1,
          avg_dwell_time: 1,
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
          "zone_sequence.entry_time": { $gte: today, $lt: nextDay },
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
    const totalStopEventsAgg = await interactionLogSchema.countDocuments({
      location_id: locationId,
      zone_id: zoneId,
      event_type: "stop",
      start_time: { $gte: today, $lt: nextDay },
    });
    return totalStopEventsAgg;
  },
};
module.exports = zoneStatsWorker;
