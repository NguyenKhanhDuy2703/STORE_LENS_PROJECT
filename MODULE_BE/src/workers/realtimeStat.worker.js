const locationStatsSchema = require("../schemas/locationStats.schema");
const { dateUtil } = require("../utils/date.util");
const logger = require("../utils/logging");

/**
 * Xử lý data từ zone_analysis_channel:
 *   payload.data  = { "ZONE_CAM1_001": 2, "ZONE_CAM1_002": 1, ... }
 *   payload.infor = { camera_id, location_id }
 *
 * Luồng:
 *  1. Tính tổng people_current = sum(zone_counts)
 *  2. Upsert LocationStats.realtime (persist để load trang đầu đúng)
 *  3. Emit Socket.IO tới room location_id
 */
const realtimeStatWorker = {
  async process({ payload, io }) {
    const { data, infor } = payload;

    if (!data || typeof data !== "object" || !infor?.location_id) {
      logger.warn(`[realtimeStat] Invalid payload: ${JSON.stringify(payload)}`);
      return;
    }

    const { location_id } = infor;

    // Hỗ trợ cả payload cũ (object zone_counts trực tiếp) và payload mới { zone_counts, total_in_store }
    const zoneCounts = data.zone_counts ?? data;
    const totalInStore = data.total_in_store ?? Object.values(zoneCounts).reduce(
      (sum, count) => sum + (Number(count) || 0),
      0,
    );

    // Upsert vào LocationStats.realtime (persist)
    try {
      const { startDate: today } = dateUtil({ type: "today" });

      const zoneCountsSet = {};
      for (const [zoneId, count] of Object.entries(zoneCounts)) {
        zoneCountsSet[`realtime.zone_counts.${zoneId}`] = Number(count) || 0;
      }

      await locationStatsSchema.updateOne(
        { location_id, date: today },
        {
          $set: {
            "realtime.people_current": totalInStore,
            ...zoneCountsSet,
          },
          $setOnInsert: {
            location_id,
            date: today,
          },
        },
        { upsert: true },
      );
    } catch (err) {
      logger.error(`[realtimeStat] DB upsert failed: ${err.message}`);
    }

    // Emit realtime qua Socket.IO tới room của location
    if (io) {
      io.to(location_id).emit("realtime_people_count", {
        location_id,
        people_current: totalInStore,
        zone_counts: zoneCounts,
      });
    }
  },
};

module.exports = realtimeStatWorker;
