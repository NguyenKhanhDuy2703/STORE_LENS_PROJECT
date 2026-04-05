const BusinessEvent = require('../schemas/businessEvent.schema');
const Session = require('../schemas/session.schema');
const LocationStats = require('../schemas/locationStats.schema');
const Zone = require('../schemas/zone.schema');
const logger = require('../utils/logging');

const getKPIMetrics = async (locationIds, startDate, endDate) => {
    try {
        // Nếu không có locationIds, lấy tất cả
        const locationFilter = locationIds && locationIds.length > 0 ? { location_id: { $in: locationIds } } : {};
        const dateFilter = { $gte: startDate, $lte: endDate };

        // Tổng Doanh Thu
        const totalRevenueResult = await BusinessEvent.aggregate([
            { $match: { ...locationFilter, date: dateFilter } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Tổng Khách Hàng
        const totalCustomers = await Session.countDocuments({
            ...locationFilter,
            entry_time: dateFilter
        });

    
        // Tỷ lệ chuyển đổi = (Tổng số giao dịch mua hàng ( count BusinessEvent) / Tổng số khách hàng (count Session)) * 100
        const totalPurchases = await BusinessEvent.countDocuments({
            ...locationFilter,
            date: dateFilter
        });
        const conversionRate = totalCustomers > 0 ? (totalPurchases / totalCustomers) * 100 : 0;

        // SL Khách Hiện Tại
        const currentCustomers = await Session.countDocuments({
            ...locationFilter,
            exit_time: null
        });

        // SL Chờ Tại Quầy - lấy từ LocationStats realtime, latest
        const latestStats = await LocationStats.find({
            ...locationFilter,
            date: { $lte: endDate }
        }).sort({ date: -1 }).limit(locationIds && locationIds.length > 0 ? locationIds.length : 100);

        let queueCount = 0;
        if (latestStats.length > 0) {
            queueCount = latestStats.reduce((sum, stat) => sum + (stat.realtime ? stat.realtime.checkout_length : 0), 0);
        }

        return {
            totalRevenue,
            totalCustomers,
            conversionRate: Math.round(conversionRate * 100) / 100,
            currentCustomers,
            queueCount,
            lastUpdated: new Date()
        };
    } catch (error) {
        logger.error('Error getting dashboard data:', error);
        throw error;
    }
}

const getHourlyCustomerFlow = async (locationIds, startDate, endDate) => {
    try {
        // Nếu không có locationIds, lấy tất cả
        const locationFilter = locationIds && locationIds.length > 0 ? { location_id: { $in: locationIds } } : {};

        // Lấy dữ liệu từ LocationStats, expanded chart_data
        const hourlyData = await LocationStats.aggregate([
            { $match: { ...locationFilter, date: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$chart_data' },
            { $group: {
                _id: '$chart_data.hour',
                totalPeople: { $sum: '$chart_data.people_count' },
                totalRevenue: { $sum: '$chart_data.total_revenue' },
                locationCount: { $sum: 1 }
            }},
            { $sort: { _id: 1 } },
            { $project: {
                hour: '$_id',
                customerCount: '$totalPeople',
                totalRevenue: '$totalRevenue',
                _id: 0
            }}
        ]);

        return {
            hourly: hourlyData,
            lastUpdated: new Date()
        };
    } catch (error) {
        logger.error('Error getting hourly customer flow:', error);
        throw error;
    }
}

const getRevenueLast7Days = async (locationIds) => {
    try {
        // Nếu không có locationIds, lấy tất cả
        const locationFilter = locationIds && locationIds.length > 0 ? { location_id: { $in: locationIds } } : {};
        
        // Tính startDate và endDate cho 7 ngày gần nhất
        const now = new Date();
        const endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const dateFilter = { $gte: startDate, $lte: endDate };

        // Tổng doanh thu 7 ngày
        const totalRevenueResult = await BusinessEvent.aggregate([
            { $match: { ...locationFilter, date: dateFilter } },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Chi tiết theo ngày
        const dailyRevenue = await BusinessEvent.aggregate([
            { $match: { ...locationFilter, date: dateFilter } },
            { $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$date' }
                },
                revenue: { $sum: '$total_amount' }
            }},
            { $sort: { _id: 1 } },
            { $project: {
                date: '$_id',
                revenue: '$revenue',
                _id: 0
            }}
        ]);

        return {
            totalRevenue,
            daily: dailyRevenue,
            startDate,
            endDate,
            lastUpdated: new Date()
        };
    } catch (error) {
        logger.error('Error getting revenue for last 7 days:', error);
        throw error;
    }
}

const getHighTrafficZones = async (locationIds, startDate, endDate) => {
    try {
        const locationFilter = locationIds && locationIds.length > 0 ? { location_id: { $in: locationIds } } : {};
        const previousRange = getPreviousRange(startDate, endDate);

        const currentZones = await Session.aggregate([
            { $match: { ...locationFilter, entry_time: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$zone_sequence' },
            { $group: {
                _id: '$zone_sequence.zone_id',
                customerCount: { $sum: 1 }
            }},
            { $sort: { customerCount: -1 } },
            { $lookup: {
                from: 'zones',
                localField: '_id',
                foreignField: 'zone_id',
                as: 'zoneInfo'
            }},
            { $unwind: { path: '$zoneInfo', preserveNullAndEmptyArrays: true } },
            { $project: {
                zoneId: '$_id',
                zoneName: { $ifNull: ['$zoneInfo.zone_name', '$_id'] },
                customerCount: 1,
                _id: 0
            }}
        ]);

        const previousZones = await Session.aggregate([
            { $match: { ...locationFilter, entry_time: { $gte: previousRange.start, $lte: previousRange.end } } },
            { $unwind: '$zone_sequence' },
            { $group: {
                _id: '$zone_sequence.zone_id',
                customerCount: { $sum: 1 }
            }},
            { $project: {
                zoneId: '$_id',
                customerCount: 1,
                _id: 0
            }}
        ]);

        const previousMap = previousZones.reduce((acc, item) => {
            acc[item.zoneId] = item.customerCount;
            return acc;
        }, {});

        const rankedZones = currentZones.map((zone, index) => {
            const prevCount = previousMap[zone.zoneId] || 0;
            const diff = zone.customerCount - prevCount;
            const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';

            return {
                rank: index + 1,
                zoneId: zone.zoneId,
                zoneName: zone.zoneName,
                customerCount: zone.customerCount,
                previousCustomerCount: prevCount,
                diff,
                trend
            };
        });

        return {
            zones: rankedZones,
            total: rankedZones.length,
            lastUpdated: new Date()
        };
    } catch (error) {
        logger.error('Error getting high traffic zones:', error);
        throw error;
    }
}

const getZonePerformanceDetails = async (locationIds, startDate, endDate) => {
    try {
        const locationFilter = locationIds && locationIds.length > 0 ? { location_id: { $in: locationIds } } : {};
        const sessionDateFilter = { entry_time: { $gte: startDate, $lte: endDate } };

        const totalSessions = await Session.countDocuments({ ...locationFilter, ...sessionDateFilter });

        const zoneDetails = await Session.aggregate([
            { $match: { ...locationFilter, ...sessionDateFilter } },
            { $unwind: '$zone_sequence' },
            { $group: {
                _id: '$zone_sequence.zone_id',
                visits: { $sum: 1 },
                avgDwellSeconds: { $avg: '$zone_sequence.dwell_time_seconds' }
            }},
            { $lookup: {
                from: 'zones',
                localField: '_id',
                foreignField: 'zone_id',
                as: 'zoneInfo'
            }},
            { $unwind: { path: '$zoneInfo', preserveNullAndEmptyArrays: true } },
            { $project: {
                zoneId: '$_id',
                zoneName: { $ifNull: ['$zoneInfo.zone_name', '$_id'] },
                visits: 1,
                avgDwellSeconds: 1,
                _id: 0
            }},
            { $sort: { visits: -1 } }
        ]);

        const colors = ['#0d9488', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#14b8a6', '#f97316', '#c2410c'];

        const zones = zoneDetails.map((zone, index) => ({
            rank: index + 1,
            zoneId: zone.zoneId,
            zoneName: zone.zoneName,
            conversionRate: totalSessions > 0 ? Math.round((zone.visits / totalSessions) * 100) : 0,
            dwellTime: `${Math.round(zone.avgDwellSeconds / 60)} phút`,
            color: colors[index % colors.length]
        }));

        return {
            zones,
            total: zones.length,
            lastUpdated: new Date()
        };
    } catch (error) {
        logger.error('Error getting zone performance details:', error);
        throw error;
    }
}

const getPreviousRange = (startDate, endDate) => {
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    const durationMs = currentEnd.getTime() - currentStart.getTime();
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - durationMs);
    previousStart.setHours(0, 0, 0, 0);
    previousEnd.setHours(23, 59, 59, 999);

    return { start: previousStart, end: previousEnd };
}

/**
 * Helper function để xử lý period và trả về startDate, endDate
 * @param {string} period - 'today', 'yesterday', 'last_week', 'this_week', 'last_month', 'this_month', 'last_year', 'this_year'
 * @returns {Object} { start, end }
 */
const getPeriodDateRange = (period) => {
    const now = new Date();
    let start, end;

    switch (period) {
        case 'yesterday':
            start = new Date(now);
            start.setDate(now.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
            break;
        case 'last_week':
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            start = new Date(now);
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case 'this_week':
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            start = new Date(now);
            start.setDate(now.getDate() - diffToMonday);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case 'last_month':
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'this_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            start.setHours(0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'last_year':
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            start = new Date(now.getFullYear() - 1, 0, 1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'this_year':
            start = new Date(now.getFullYear(), 0, 1);
            start.setHours(0, 0, 0, 0);
            end = new Date(now.getFullYear(), 11, 31);
            end.setHours(23, 59, 59, 999);
            break;
        case 'today':
        default:
            start = new Date(now);
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            break;
    }

    return { start, end };
}

/**
 * Helper function để parse location_id từ query param
 * @param {string} locationIdParam - location_id từ query string
 * @returns {Array} Array chứa location_id (Array có 1 phần tử hoặc rỗng)
 */
const parseLocationIds = (locationIdParam) => {
    let locationIds = [];
    if (locationIdParam) {
        locationIds = [locationIdParam.trim().replace(/^["']|["']$/g, '')];
    }
    return locationIds;
}

module.exports = { getKPIMetrics, getHourlyCustomerFlow, getRevenueLast7Days, getHighTrafficZones, getZonePerformanceDetails, getPeriodDateRange, parseLocationIds,getPreviousRange };