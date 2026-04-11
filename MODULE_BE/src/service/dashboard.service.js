const Session = require('../schemas/session.schema');
const LocationStats = require('../schemas/locationStats.schema');
const { dateUtil } = require('../utils/date.util');

const buildDateFilter = ({ type, startCustom, endCustom, date, defaultType = 'today' }) => {
    const filterType = type || (date ? 'custom' : defaultType);
    const customStart = startCustom || date;
    const customEnd = endCustom || date;

    const { startDate, endDate } = dateUtil({
        type: filterType,
        startCustom: customStart,
        endCustom: customEnd
    });

    return { $gte: startDate, $lte: endDate };
};

const getKPIMetrics = async ({ locationId, type, startCustom, endCustom, date } = {}) => {
    try {
        const dateFilter = buildDateFilter({ type, startCustom, endCustom, date });
        const query = { location_id: locationId, date: dateFilter };

        const stats = await LocationStats.findOne(query).sort({ updated_at: -1 });

        if (!stats) {
            return {
                total_revenue: 0,
                total_customers: 0,
                conversion_rate: 0,
                current_visitors: 0,
                waiting_queue: 0,
                last_updated: new Date()
            };
        }

        return {
            total_revenue: stats.kpis?.total_revenue ?? 0,
            total_customers: stats.kpis?.total_visitors ?? 0,
            conversion_rate: stats.kpis?.conversion_rate ?? 0,
            current_visitors: stats.realtime?.people_current ?? 0,
            waiting_queue: stats.realtime?.checkout_length ?? 0,
            last_updated: stats.updated_at,
            location_id: stats.location_id,
            date: stats.date
        };
    } catch (error) {
        throw error;
    }
};

const getHourlyCustomerFlow = async ({ locationId, type, startCustom, endCustom, date } = {}) => {
    try {
        const dateFilter = buildDateFilter({ type, startCustom, endCustom, date });
        const stats = await LocationStats.findOne({ location_id: locationId, date: dateFilter });

        return {
            hourly: stats?.chart_data || [],
            lastUpdated: new Date()
        };
    } catch (error) {

        throw error;
    }
};

const getRevenueLast7Days = async ({ locationId }) => {
    try {
        const { startDate, endDate } = dateUtil({ type: 'last7days' });

        const stats = await LocationStats.find({
            location_id: locationId,
            date: { $gte: startDate, $lte: endDate }
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

const getHighTrafficZones = async ({ locationId, type, startCustom, endCustom, date } = {}) => {
    try {
        const dateFilter = buildDateFilter({ type, startCustom, endCustom, date });

        const zoneTraffic = await Session.aggregate([
            { $match: { location_id: locationId, entry_time: dateFilter } },
            { $unwind: "$zone_sequence" },
            {
                $group: {
                    _id: "$zone_sequence.zone_id",
                    count: { $sum: 1 },
                    zone_name: { $first: "$zone_sequence.zone_name" }
                }
            },
            { $sort: { count: -1 } },
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

const getZonePerformanceDetails = async ({ locationId, type, startCustom, endCustom, date } = {}) => {
    try {
        const dateFilter = buildDateFilter({ type, startCustom, endCustom, date });

        const performance = await Session.aggregate([
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

module.exports = {
    getKPIMetrics,
    getHourlyCustomerFlow,
    getRevenueLast7Days,
    getHighTrafficZones,
    getZonePerformanceDetails
};
