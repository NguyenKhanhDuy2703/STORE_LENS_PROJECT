const zoneStatsSchema = require('../schemas/zoneStats.schema');
const LocationStatsSchema = require('../schemas/locationStats.schema');
const SessionSchema = require('../schemas/session.schema');
const { dateUtil } = require('../utils/date.util');

const getKPIMetrics = async ({ locationId, type, startCustom, endCustom } = {}) => {
    try {
        const filterType = type || ((startCustom || endCustom) ? 'custom' : 'today');
        const customStart = startCustom;
        const customEnd = endCustom;
        const { startDate, endDate } = dateUtil({ type: filterType, startCustom: customStart, endCustom: customEnd });
        const dateFilter = { $gte: startDate, $lte: endDate };
        const query = { location_id: locationId, date: dateFilter };

        const stats = await LocationStatsSchema.findOne(query).sort({ updated_at: -1 });

        if (!stats) {
            return {
                total_revenue: 0,
                total_customers: 0,
                conversion_rate: 0,
                current_visitors: 0,
                waiting_queue: 0,
                zone_counts: {},
                last_updated: new Date()
            };
        }

        return {
            total_revenue: stats.kpis?.total_revenue ?? 0,
            total_customers: stats.kpis?.total_visitors ?? 0,
            conversion_rate: stats.kpis?.conversion_rate ?? 0,
            current_visitors: stats.realtime?.people_current ?? 0,
            waiting_queue: stats.realtime?.checkout_length ?? 0,
            zone_counts: stats.realtime?.zone_counts
                ? Object.fromEntries(stats.realtime.zone_counts)
                : {},
            last_updated: stats.updated_at,
            location_id: stats.location_id,
            date: stats.date
        };
    } catch (error) {
        throw error;
    }
};

const getHourlyCustomerFlow = async ({ locationId, type, startCustom, endCustom } = {}) => {
    try {
        const filterType = type || ((startCustom || endCustom) ? 'custom' : 'today');
        const customStart = startCustom;
        const customEnd = endCustom;
        const { startDate, endDate } = dateUtil({ type: filterType, startCustom: customStart, endCustom: customEnd });
        const dateFilter = { $gte: startDate, $lte: endDate };
        const stats = await LocationStatsSchema.findOne({ location_id: locationId, date: dateFilter });

        return {
            hourly: stats?.chart_data || [],
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const getRevenueLast7Days = async ({ locationId, type, startCustom, endCustom } = {}) => {
    try {
        const filterType = type || ((startCustom || endCustom) ? 'custom' : 'last7days');
        const customStart = startCustom;
        const customEnd = endCustom;
        const { startDate, endDate } = dateUtil({ type: filterType, startCustom: customStart, endCustom: customEnd });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const stats = await LocationStatsSchema.find({
            location_id: locationId,
            date: dateFilter
        }).select('date kpis.total_revenue').sort({ date: 1 });

        return {
            revenue_data: stats.map(s => ({
                date: s.date,
                total_revenue: s.kpis?.total_revenue || 0
            })),
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const getHighTrafficZones = async ({ locationId, type, startCustom, endCustom } = {}) => {
    try {
        const filterType = type || ((startCustom || endCustom) ? 'custom' : 'today');
        const customStart = startCustom;
        const customEnd = endCustom;
        const { startDate, endDate } = dateUtil({ type: filterType, startCustom: customStart, endCustom: customEnd });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const zoneTraffic = await zoneStatsSchema.aggregate([
            { $match: { location_id: locationId, date: dateFilter } },
            { $lookup: {
                from: 'zones',
                localField: 'zone_id',
                foreignField: 'zone_id',
                as: 'zone_info'
            }},
            { $unwind: "$zone_info" },
            { $project: {
                zone_id: 1,
                zone_name: "$zone_info.zone_name",
                people_count: "$performance.people_count",
                total_sales_value: "$performance.total_sales_value",
                conversion_rate: "$performance.conversion_rate",
                avg_dwell_time: "$performance.avg_dwell_time",
                total_stop_events: "$performance.total_stop_events",
                top_asset_id: "$performance.top_asset_id",
                peak_hour: "$performance.peak_hour"
            }},
            { $sort: { people_count: -1 } },
            { $limit: 5 }
        ]);
        return {
            zones: zoneTraffic,
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const getZonePerformanceDetails = async ({ locationId, type, startCustom, endCustom } = {}) => {
    try {
        const filterType = type || ((startCustom || endCustom) ? 'custom' : 'today');
        const customStart = startCustom;
        const customEnd = endCustom;
        const { startDate, endDate } = dateUtil({ type: filterType, startCustom: customStart, endCustom: customEnd });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const performance = await SessionSchema.aggregate([
            { $match: { location_id: locationId, entry_time: dateFilter } },
            { $unwind: "$zone_sequence" },
            {
                $group: {
                    _id: "$zone_sequence.zone_id",
                    zone_name: { $first: "$zone_sequence.zone_name" },
                    avg_dwell_time: { $avg: { $subtract: ["$zone_sequence.exit_time", "$zone_sequence.entry_time"] } },
                    total_sessions: { $sum: 1 }
                }
            },
            { $sort: { total_sessions: -1 } }
        ]);

        return {
            performance,
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const getZoneAnalyticsDashboard = async ({ locationId, type, startCustom, endCustom } = {}) => {
    try {
        const [highTrafficResult, performanceResult] = await Promise.all([
            getHighTrafficZones({ locationId, type, startCustom, endCustom }),
            getZonePerformanceDetails({ locationId, type, startCustom, endCustom })
        ]);

        return {
            zones: highTrafficResult?.zones || [],
            performance: performanceResult?.performance || [],
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getKPIMetrics,
    getHourlyCustomerFlow,
    getRevenueLast7Days,
    getZoneAnalyticsDashboard
};