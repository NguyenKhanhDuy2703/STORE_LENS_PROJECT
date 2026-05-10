const moment = require('moment-timezone');
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

// ── Monthly dashboard services ────────────────────────────────────────────────

/**
 * Lấy KPI tổng hợp cho 1 tháng cụ thể (aggregate nhiều ngày)
 */
const getMonthlyKPIMetrics = async ({ locationId, year, month }) => {
    try {
        const { startDate, endDate } = dateUtil({ type: 'specificMonth', year, month });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const result = await LocationStatsSchema.aggregate([
            { $match: { location_id: locationId, date: dateFilter } },
            {
                $group: {
                    _id: null,
                    total_revenue:    { $sum: '$kpis.total_revenue' },
                    total_customers:  { $sum: '$kpis.total_visitors' },
                    total_events:     { $sum: '$kpis.total_events' },
                    avg_dwell_time:   { $avg: '$kpis.avg_store_dwell_time' },
                    days_with_data:   { $sum: 1 }
                }
            }
        ]);

        const agg = result[0] || {};
        const totalCustomers = agg.total_customers || 0;
        const totalEvents    = agg.total_events    || 0;

        // Lấy realtime từ document mới nhất (chỉ có ý nghĩa khi là tháng hiện tại)
        const latestDoc = await LocationStatsSchema
            .findOne({ location_id: locationId, date: dateFilter })
            .sort({ date: -1 });

        return {
            total_revenue:    agg.total_revenue    ?? 0,
            total_customers:  totalCustomers,
            conversion_rate:  totalCustomers > 0
                ? Number(((totalEvents / totalCustomers) * 100).toFixed(2))
                : 0,
            avg_dwell_time:   Math.round(agg.avg_dwell_time ?? 0),
            days_with_data:   agg.days_with_data   ?? 0,
            // Realtime — chỉ có giá trị khi xem tháng hiện tại
            current_visitors: latestDoc?.realtime?.people_current ?? 0,
            waiting_queue:    latestDoc?.realtime?.checkout_length ?? 0,
            zone_counts:      latestDoc?.realtime?.zone_counts
                ? Object.fromEntries(latestDoc.realtime.zone_counts)
                : {},
            last_updated: latestDoc?.updated_at ?? new Date(),
            year,
            month
        };
    } catch (err) {
        throw err;
    }
};

/**
 * Lấy dữ liệu theo từng ngày trong tháng (cho daily charts)
 */
const getDailyStats = async ({ locationId, year, month }) => {
    try {
        const { startDate, endDate } = dateUtil({ type: 'specificMonth', year, month });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const stats = await LocationStatsSchema.find({
            location_id: locationId,
            date: dateFilter
        })
        .select('date kpis.total_visitors kpis.total_revenue')
        .sort({ date: 1 });

        return {
            daily_data: stats.map(s => ({
                day:          new Date(s.date).getDate(),
                date:         s.date,
                people_count: s.kpis?.total_visitors || 0,
                revenue:      s.kpis?.total_revenue  || 0
            })),
            year,
            month,
            lastUpdated: new Date()
        };
    } catch (err) {
        throw err;
    }
};

/**
 * Zone analytics aggregate cho 1 tháng
 */
const getMonthlyZoneAnalytics = async ({ locationId, year, month }) => {
    try {
        const { startDate, endDate } = dateUtil({ type: 'specificMonth', year, month });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const [zoneTraffic, performance] = await Promise.all([
            // Aggregate zone stats theo tháng
            zoneStatsSchema.aggregate([
                { $match: { location_id: locationId, date: dateFilter } },
                {
                    $group: {
                        _id: '$zone_id',
                        people_count:       { $sum: '$performance.people_count' },
                        total_sales_value:  { $sum: '$performance.total_sales_value' },
                        total_events:       { $sum: '$performance.total_events' },
                        avg_dwell_time:     { $avg: '$performance.avg_dwell_time' },
                        total_stop_events:  { $sum: '$performance.total_stop_events' },
                        top_asset_id:       { $last: '$performance.top_asset_id' },
                        peak_hour:          { $last: '$performance.peak_hour' }
                    }
                },
                {
                    $lookup: {
                        from: 'zones',
                        localField: '_id',
                        foreignField: 'zone_id',
                        as: 'zone_info'
                    }
                },
                { $unwind: { path: '$zone_info', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        zone_id:           '$_id',
                        zone_name:         { $ifNull: ['$zone_info.zone_name', '$_id'] },
                        people_count:      1,
                        total_sales_value: 1,
                        conversion_rate: {
                            $cond: [
                                { $gt: ['$people_count', 0] },
                                { $multiply: [{ $divide: ['$total_events', '$people_count'] }, 100] },
                                0
                            ]
                        },
                        avg_dwell_time:    1,
                        total_stop_events: 1,
                        top_asset_id:      1,
                        peak_hour:         1
                    }
                },
                { $sort: { people_count: -1 } },
                { $limit: 5 }
            ]),
            // Session performance
            SessionSchema.aggregate([
                { $match: { location_id: locationId, entry_time: dateFilter } },
                { $unwind: '$zone_sequence' },
                {
                    $group: {
                        _id:           '$zone_sequence.zone_id',
                        zone_name:     { $first: '$zone_sequence.zone_name' },
                        avg_dwell_time: { $avg: { $subtract: ['$zone_sequence.exit_time', '$zone_sequence.entry_time'] } },
                        total_sessions: { $sum: 1 }
                    }
                },
                { $sort: { total_sessions: -1 } }
            ])
        ]);

        return {
            zones:       zoneTraffic,
            performance: performance,
            lastUpdated: new Date()
        };
    } catch (err) {
        throw err;
    }
};

// ── Yearly dashboard services ─────────────────────────────────────────────────

/**
 * Lấy dữ liệu tổng hợp theo từng tháng trong cả năm (12 phần tử cố định)
 * @param {Object} params
 * @param {string} params.locationId
 * @param {number} params.year
 * @returns {{ yearly_data: Array, year: number, lastUpdated: Date }}
 */
const getYearlyStats = async ({ locationId, year }) => {
    try {
        const TIMEZONE = 'Asia/Ho_Chi_Minh';

        // Tính startDate / endDate cho cả năm theo timezone Asia/Ho_Chi_Minh
        const startDate = moment.tz(`${year}-01-01`, 'YYYY-MM-DD', TIMEZONE).startOf('year').toDate();
        const endDate   = moment.tz(`${year}-12-31`, 'YYYY-MM-DD', TIMEZONE).endOf('year').toDate();

        // Aggregate theo tháng
        const results = await LocationStatsSchema.aggregate([
            {
                $match: {
                    location_id: locationId,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id:             { $month: '$date' },
                    total_customers: { $sum: '$kpis.total_visitors' },
                    total_revenue:   { $sum: '$kpis.total_revenue' }
                }
            }
        ]);

        // Tạo map month → data để tra cứu nhanh
        const dataByMonth = {};
        for (const item of results) {
            dataByMonth[item._id] = {
                total_customers: item.total_customers,
                total_revenue:   item.total_revenue
            };
        }

        // Xây dựng mảng 12 phần tử cố định (tháng 1–12), fill 0 cho tháng thiếu
        const yearly_data = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            return {
                month,
                total_customers: dataByMonth[month]?.total_customers ?? 0,
                total_revenue:   dataByMonth[month]?.total_revenue   ?? 0
            };
        });

        return {
            yearly_data,
            year,
            lastUpdated: new Date()
        };
    } catch (err) {
        throw err;
    }
};

module.exports = {
    getKPIMetrics,
    getHourlyCustomerFlow,
    getRevenueLast7Days,
    getZoneAnalyticsDashboard,
    // Monthly
    getMonthlyKPIMetrics,
    getDailyStats,
    getMonthlyZoneAnalytics,
    // Yearly
    getYearlyStats
};