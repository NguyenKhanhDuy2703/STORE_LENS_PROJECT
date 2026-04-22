const interactionLogSchema = require("../schemas/interactionLog.schema");
const zoneStatsSchema = require("../schemas/zoneStats.schema");
const { dateUtil } = require("../utils/date.util");

const dwellTimeService = {
    async getMetrics({ locationId, date }) {
        if (!locationId) {
            return {
                max_time: 0,
                min_time: 0,
                avg_time: 0,
            };
        }

        // FE có thể gửi type (today/last7days...) hoặc ngày cụ thể (YYYY-MM-DD)
        let startDate;
        let endDate;

        if (!date) {
            ({ startDate, endDate } = dateUtil({ type: "today" }));
        } else {
            try {
                ({ startDate, endDate } = dateUtil({ type: date }));
            } catch (error) {
                ({ startDate, endDate } = dateUtil({
                    type: "custom",
                    startCustom: date,
                    endCustom: date,
                }));
            }
        }

        const metrics = await interactionLogSchema.aggregate([
            {
                $match: {
                    location_id: locationId,
                    event_type: "stop",
                    duration_seconds: { $gt: 0 },
                    start_time: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: "$zone_id",
                    zone_total_dwell_time: { $sum: "$duration_seconds" },
                    total_stop_events: { $sum: 1 },
                },
            },
            {
                $sort: {
                    zone_total_dwell_time: -1,
                },
            },
            {
                $group: {
                    _id: null,
                    max_time: { $first: "$zone_total_dwell_time" },
                    min_time: { $last: "$zone_total_dwell_time" },
                    total_dwell_time: { $sum: "$zone_total_dwell_time" },
                    total_stop_events: { $sum: "$total_stop_events" },
                },
            },
            {
                $project: {
                    _id: 0,
                    max_time: 1,
                    min_time: 1,
                    avg_time: {
                        $cond: [
                            { $gt: ["$total_stop_events", 0] },
                            { $divide: ["$total_dwell_time", "$total_stop_events"] },
                            0,
                        ],
                    },
                },
            },
        ]);

        return metrics[0] || {
            max_time: 0,
            min_time: 0,
            avg_time: 0,
        };
    },

    async getPerformanceInteract({ locationId, date }) {
        if (!locationId) {
            return [];
        }

        // FE có thể gửi type (today/last7days...) hoặc ngày cụ thể (YYYY-MM-DD)
        let startDate;
        let endDate;

        if (!date) {
            ({ startDate, endDate } = dateUtil({ type: "today" }));
        } else {
            try {
                ({ startDate, endDate } = dateUtil({ type: date }));
            } catch (error) {
                ({ startDate, endDate } = dateUtil({
                    type: "custom",
                    startCustom: date,
                    endCustom: date,
                }));
            }
        }

        const hourlyData = await interactionLogSchema.aggregate([
            {
                $match: {
                    location_id: locationId,
                    event_type: "stop",
                    duration_seconds: { $gt: 0 },
                    start_time: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: {
                        $hour: {
                            date: "$start_time",
                            timezone: "Asia/Ho_Chi_Minh",
                        },
                    },
                    visitors_set: { $addToSet: "$session_uuid" },
                    time_stop_total: { $sum: "$duration_seconds" },
                },
            },
            {
                $project: {
                    _id: 0,
                    hour: {
                        $concat: [
                            {
                                $cond: [
                                    { $lt: ["$_id", 10] },
                                    { $concat: ["0", { $toString: "$_id" }] },
                                    { $toString: "$_id" },
                                ],
                            },
                            ":00",
                        ],
                    },
                    vistors: { $size: "$visitors_set" },
                    Time_stop: "$time_stop_total",
                },
            },
            {
                $sort: {
                    hour: 1,
                },
            },
        ]);

        return hourlyData;
    },

    getAnalysisDwellTime: async ({ location_id, date }) => {
        if (!location_id) {
            return [];
        }
        let startDate;
        let endDate;

        if (!date) {
            ({ startDate, endDate } = dateUtil({ type: "today" }));
        } else {
            try {
                ({ startDate, endDate } = dateUtil({ type: date }));
            } catch (error) {

                ({ startDate, endDate } = dateUtil({
                    type: "custom",
                    startCustom: date,
                    endCustom: date,
                }));
            }
        }

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