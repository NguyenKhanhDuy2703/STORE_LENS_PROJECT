const ZoneStatsSchema = require('../schemas/zoneStats.schema');
const ZoneSchema = require('../schemas/zone.schema');
const { dateUtil } = require('../utils/date.util');

const parseHourNumber = (hour) => {
    const normalized = String(hour ?? '').split(':')[0];
    const value = Number.parseInt(normalized, 10);
    return Number.isNaN(value) ? 0 : value;
};

const normalizeHourlyTraffic = (rows) => {
    if (!Array.isArray(rows)) {
        return [];
    }

    const hourMap = new Map();
    rows.forEach((item) => {
        if (!item) return;
        const hourKey = String(item.hour ?? '').trim();
        if (!hourKey) return;
        const count = Number(item.count ?? 0);
        const current = hourMap.get(hourKey) || 0;
        hourMap.set(hourKey, current + (Number.isNaN(count) ? 0 : count));
    });

    return Array.from(hourMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => parseHourNumber(a.hour) - parseHourNumber(b.hour));
};

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

        if (zoneId) {
            const stats = await ZoneStatsSchema.findOne({
                location_id: locationId,
                zone_id: zoneId,
                date: dateFilter,
            }).sort({ updated_at: -1 });

            return {
                hourly: normalizeHourlyTraffic(stats?.hourly_traffic || []),
                lastUpdated: stats?.updated_at || new Date(),
            };
        }

        const statsList = await ZoneStatsSchema.find({
            location_id: locationId,
            date: dateFilter,
        }).lean();

        const hourlyRows = statsList.flatMap((item) => item.hourly_traffic || []);
        const lastUpdated = statsList.reduce(
            (latest, item) => (item.updated_at && item.updated_at > latest ? item.updated_at : latest),
            new Date(0),
        );

        return {
            hourly: normalizeHourlyTraffic(hourlyRows),
            lastUpdated: lastUpdated > new Date(0) ? lastUpdated : new Date(),
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