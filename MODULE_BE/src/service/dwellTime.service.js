// SessionSchema removed — dwellTime service reads only from zoneStats (stable snapshots)
const zoneStatsSchema = require("../schemas/zoneStats.schema");
const { dateUtil } = require("../utils/date.util");

const dwellTimeService = {
    async getMetrics({ locationId, date }) {
        if (!locationId) {
            return { max_time: 0, min_time: 0, avg_time: 0 };
        }

        const { startDate, endDate } = dateUtil({ type: "today" });

        const metrics = await zoneStatsSchema.aggregate([
            {
                $match: {
                    location_id: locationId,
                    date: { $gte: startDate, $lte: endDate },
                    "performance.avg_dwell_time": { $gt: 0 },
                },
            },
            {
                $lookup: {
                    from: "zones",
                    localField: "zone_id",
                    foreignField: "zone_id",
                    as: "zone_info",
                },
            },
            { $unwind: { path: "$zone_info", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    zone_name: { $ifNull: ["$zone_info.zone_name", "$zone_id"] },
                    avg_dwell: "$performance.avg_dwell_time",
                },
            },
            { $sort: { avg_dwell: -1 } },
            {
                $group: {
                    _id: null,
                    max_time: { $first: "$avg_dwell" },
                    max_zone_name: { $first: "$zone_name" },
                    min_time: { $last: "$avg_dwell" },
                    min_zone_name: { $last: "$zone_name" },
                    avg_time: { $avg: "$avg_dwell" },
                },
            },
            { $project: { _id: 0, max_time: 1, max_zone_name: 1, min_time: 1, min_zone_name: 1, avg_time: 1 } },
        ]);

        return metrics[0] || { max_time: 0, max_zone_name: null, min_time: 0, min_zone_name: null, avg_time: 0 };
    },

    async getPerformanceInteract({ locationId, date }) {
        if (!locationId) {
            return [];
        }

        const { startDate, endDate } = dateUtil({ type: "today" });

        // Đọc từ zoneStats — trả về per-zone với field names giữ nguyên cho FE
        const zoneData = await zoneStatsSchema.aggregate([
            {
                $match: {
                    location_id: locationId,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $lookup: {
                    from: "zones",
                    localField: "zone_id",
                    foreignField: "zone_id",
                    as: "zone_info",
                },
            },
            { $unwind: { path: "$zone_info", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    hour: { $ifNull: ["$zone_info.zone_name", "$zone_id"] },
                    visitors: "$performance.people_count",
                    Time_stop: "$performance.avg_dwell_time",
                },
            },
            { $sort: { visitors: -1 } },
        ]);

        return zoneData;
    },

    getAnalysisDwellTime: async ({ location_id, date }) => {
        if (!location_id) {
            return [];
        }
        // User request: Only use today's data for dwell time analysis
        const { startDate, endDate } = dateUtil({ type: "today" });

        const zoneStats = await zoneStatsSchema.aggregate([
            {
                $match: {
                    location_id,
                    date: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $lookup: {
                    from: "zones",
                    localField: "zone_id",
                    foreignField: "zone_id",
                    as: "zone_data",
                },
            },
            {
                $unwind: {
                    path: "$zone_data",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);

        if (!zoneStats.length) {
            return [];
        }

        const totalAvgDwell = zoneStats.reduce(
            (sum, item) => sum + (item.performance?.avg_dwell_time || 0),
            0,
        );
        const totalSales = zoneStats.reduce(
            (sum, item) => sum + (item.performance?.total_sales_value || 0),
            0,
        );

        const avgStoreDwell = totalAvgDwell / zoneStats.length;
        const avgStoreSales = totalSales / zoneStats.length;

        // So sánh từng zone với mức trung bình toàn cửa hàng để gán type
        return zoneStats.map((item) => {
            const avgDwellTime = item.performance?.avg_dwell_time || 0;
            const totalSalesValue = item.performance?.total_sales_value || 0;

            let type = "POOR";
            if (avgDwellTime >= avgStoreDwell && totalSalesValue >= avgStoreSales) {
                type = "STAR";
            } else if (avgDwellTime < avgStoreDwell && totalSalesValue >= avgStoreSales) {
                type = "CASH_COW";
            } else if (avgDwellTime >= avgStoreDwell && totalSalesValue < avgStoreSales) {
                type = "CRITICAL_WARNING";
            }

            return {
                zone_name: item.zone_data?.zone_name || "Unknown Zone",
                category_name: item.zone_data?.category_name || "Unknown Category",
                people_count: item.performance?.people_count || 0,
                total_stop_events: item.performance?.total_stop_events || 0,
                avg_dwell_time: avgDwellTime,
                total_sales_value: totalSalesValue,
                type,
            };
        });
    }
};

module.exports = dwellTimeService;