const ZoneStats = require('../schemas/zoneStats.schema');
const Session = require('../schemas/session.schema');
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

const getAreaManagementMetrics = async (params = {}) => {
    try {
        const { locationId, zoneId, type, startCustom, endCustom, date } = params;
        const dateFilter = buildDateFilter({ type, startCustom, endCustom, date });
        
        const query = { location_id: locationId, zone_id: zoneId, date: dateFilter };
        const stats = await ZoneStats.findOne(query).sort({ updated_at: -1 });

        if (!stats) {
            return {
                total_visitors: 0,
                current_people: 0,
                avg_dwell_time: "0:00",
                performance_rate: 0,
                last_updated: new Date()
            };
        }

        return {
            total_visitors: stats.performance?.people_count ?? 0,
            current_people: stats.realtime?.people_in_zone ?? 0,
            avg_dwell_time: stats.performance?.avg_dwell_time ?? 0,
            performance_rate: stats.performance?.conversion_rate ?? 0,
            last_updated: stats.updated_at
        };
    } catch (error) {
        throw error;
    }
};

const getAreaHourlyTraffic = async (params = {}) => {
    try {
        const { locationId, zoneId } = params;
        const dateFilter = buildDateFilter(params);
        
        const hourlyFlow = await Session.aggregate([
            { $match: { location_id: locationId, entry_time: dateFilter, "zone_sequence.zone_id": zoneId } },
            { $unwind: "$zone_sequence" },
            { $match: { "zone_sequence.zone_id": zoneId } },
            { $group: {
                _id: { $hour: { date: "$zone_sequence.entry_time", timezone: "+07:00" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id": 1 } }
        ]);

        return {
            hourly: hourlyFlow.map(item => ({ hour: `${item._id}:00`, count: item.count })),
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const getZonePerformanceDetails = async (params = {}) => {
    try {
        const { locationId, type, startCustom, endCustom, date } = params;
        const dateFilter = buildDateFilter({ type, startCustom, endCustom, date });

        const allZonesStats = await ZoneStats.find({
            location_id: locationId,
            date: dateFilter
        }).sort({ "performance.people_count": -1 });

        return {
            table_data: allZonesStats.map(s => ({
                zone_name: s.zone_name,
                camera_id: s.metadata?.camera_id || 'N/A',
                current_people: s.realtime?.people_in_zone || 0,
                total_today: s.performance?.people_count || 0,
                growth_rate: s.performance?.growth_rate || 0, // So với hôm qua
                avg_dwell_time: s.performance?.avg_dwell_time || 0
            })),
            lastUpdated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAreaManagementMetrics,
    getAreaHourlyTraffic,
    getZonePerformanceDetails
};