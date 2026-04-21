const ZoneStatsSchema = require('../schemas/zoneStats.schema');
const SessionSchema = require('../schemas/session.schema');
const ZoneSchema = require('../schemas/zone.schema');
const { dateUtil } = require('../utils/date.util');

const getAreaManagementMetrics = async ({ locationId, zoneId, type = 'today' } = {}) => {
    try {
        const { startDate, endDate } = dateUtil({ type });
        const dateFilter = { $gte: startDate, $lte: endDate };

        if (zoneId) {
            const query = { location_id: locationId, zone_id: zoneId, date: dateFilter };
            const stats = await ZoneStatsSchema.findOne(query).sort({ updated_at: -1 });

            if (!stats) {
                return {
                    total_visitors: 0,
                    current_people: 0,
                    avg_dwell_time: 0,
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
        }

        const statsList = await ZoneStatsSchema.find({
            location_id: locationId,
            date: dateFilter
        }).sort({ updated_at: -1 });

        if (!statsList.length) {
            return {
                total_visitors: 0,
                current_people: 0,
                avg_dwell_time: 0,
                performance_rate: 0,
                last_updated: new Date()
            };
        }

        const aggregateStats = statsList.reduce(
            (accumulator, stat) => {
                const peopleCount = stat.performance?.people_count ?? 0;
                const currentPeople = stat.realtime?.people_in_zone ?? 0;
                const dwellTime = stat.performance?.avg_dwell_time ?? 0;
                const conversionRate = stat.performance?.conversion_rate ?? 0;

                accumulator.totalVisitors += peopleCount;
                accumulator.currentPeople += currentPeople;
                accumulator.totalDwellTime += dwellTime;
                accumulator.totalConversionRate += conversionRate;
                accumulator.count += 1;
                accumulator.lastUpdated = stat.updated_at;
                return accumulator;
            },
            {
                totalVisitors: 0,
                currentPeople: 0,
                totalDwellTime: 0,
                totalConversionRate: 0,
                count: 0,
                lastUpdated: new Date()
            }
        );

        return {
            total_visitors: aggregateStats.totalVisitors,
            current_people: aggregateStats.currentPeople,
            avg_dwell_time: aggregateStats.count > 0 ? aggregateStats.totalDwellTime / aggregateStats.count : 0,
            conversion_rate: aggregateStats.count > 0 ? aggregateStats.totalConversionRate / aggregateStats.count : 0,
            last_updated: aggregateStats.lastUpdated
        };
    } catch (error) {
        throw error;
    }
};

const getAreaHourlyTraffic = async ({ locationId, zoneId, type = 'today' } = {}) => {
    try {
        const { startDate, endDate } = dateUtil({ type });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const matchStage = {
            location_id: locationId,
            entry_time: dateFilter,
        };

        if (zoneId) {
            matchStage["zone_sequence.zone_id"] = zoneId;
        }

        const hourlyFlow = await SessionSchema.aggregate([
            { $match: matchStage },
            { $unwind: "$zone_sequence" },
            ...(zoneId ? [{ $match: { "zone_sequence.zone_id": zoneId } }] : []),
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

const getZonePerformanceDetails = async ({ locationId, type = 'today', cameraId } = {}) => {
    try {
        const { startDate, endDate } = dateUtil({ type });
        const dateFilter = { $gte: startDate, $lte: endDate };

        const zoneStatsQuery = {
            location_id: locationId,
            date: dateFilter
        };

        if (cameraId) {
            zoneStatsQuery.camera_code = cameraId;
        }

        const allZonesStats = await ZoneStatsSchema.find(zoneStatsQuery)
            .sort({ "performance.people_count": -1 });

        const zoneIds = allZonesStats.map((item) => item.zone_id).filter(Boolean);
        const zones = await ZoneSchema.find(
            { location_id: locationId, zone_id: { $in: zoneIds } },
            { zone_id: 1, zone_name: 1, _id: 0 }
        ).lean();
        const zoneNameMap = new Map(zones.map((zone) => [zone.zone_id, zone.zone_name]));

        return {
            table_data: allZonesStats.map(s => ({
                zone_name: zoneNameMap.get(s.zone_id) || s.zone_id || 'N/A',
                camera_code: s.camera_code || 'N/A',
                current_people: s.people_in_zone || 0,
                total_today: s.performance?.people_count || 0,
                growth_rate: s.performance?.growth_rate || 0,
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