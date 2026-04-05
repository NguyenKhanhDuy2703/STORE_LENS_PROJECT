const Session = require('../schemas/session.schema');
const logger = require('../utils/logging');
const { getPreviousRange } = require('./dashboard.service');

const calcTrend = (current, previous) => {
    const diff = current - previous;
    const percent = previous > 0 ? (diff / previous) * 100 : 0;

    return {
        value: current,
        previous,
        diff,
        percentChange: Math.round(percent * 100) / 100,
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same'
    };
};

const getAreaManagementMetrics = async (locationIds, zoneId, startDate, endDate) => {
    try {
        const locationFilter =
            locationIds && locationIds.length > 0
                ? { location_id: { $in: locationIds } }
                : {};

        const buildMatch = (start, end) => ({
            ...locationFilter,
            $or: [
                { entry_time: { $gte: start, $lte: end } },
                { 'zone_sequence.entry_time': { $gte: start, $lte: end } }
            ]
        });

        const matchCurrent = buildMatch(startDate, endDate);

        const prevRange = getPreviousRange(startDate, endDate);
        const matchPrevious = buildMatch(prevRange.start, prevRange.end);

        const getTraffic = async (match) => {
            if (zoneId) {
                const rs = await Session.aggregate([
                    { $match: match },
                    { $unwind: '$zone_sequence' },
                    { $match: { 'zone_sequence.zone_id': zoneId } },
                    { $group: { _id: '$_id' } },
                    { $count: 'count' }
                ]);
                return rs[0]?.count || 0;
            }
            return await Session.countDocuments(match);
        };

        const totalCurrent = await getTraffic(matchCurrent);
        const totalPrevious = await getTraffic(matchPrevious);

   
        const currentCustomersAgg = await Session.aggregate([
            { $match: { ...locationFilter, exit_time: null } },
            {
                $project: {
                    lastZone: {
                        $cond: [
                            { $gt: [{ $size: '$zone_sequence' }, 0] },
                            { $arrayElemAt: ['$zone_sequence.zone_id', -1] },
                            null
                        ]
                    }
                }
            },
            ...(zoneId ? [{ $match: { lastZone: zoneId } }] : []),
            { $count: 'count' }
        ]);

        const currentCustomers = currentCustomersAgg[0]?.count || 0;


        const getAvgDwell = async (match) => {
            const now = new Date();
            const rs = await Session.aggregate([
                { $match: match },
                { $unwind: '$zone_sequence' },
                ...(zoneId ? [{ $match: { 'zone_sequence.zone_id': zoneId } }] : []),
                {
                    $project: {
                        dwell: {
                            $cond: [
                                { $eq: ['$zone_sequence.exit_time', null] },
                                { $divide: [{ $subtract: [now, '$zone_sequence.entry_time'] }, 1000] },
                                '$zone_sequence.dwell_time_seconds'
                            ]
                        }
                    }
                },
                { $group: { _id: null, avg: { $avg: '$dwell' } } }
            ]);
            return rs[0]?.avg || 0;
        };

        const avgCurrent = await getAvgDwell(matchCurrent);
        const avgPrevious = await getAvgDwell(matchPrevious);


        const getZoneVisits = async (match, filterZone = true) => {
            const pipeline = [
                { $match: match },
                { $unwind: '$zone_sequence' }
            ];

            if (filterZone && zoneId) {
                pipeline.push({ $match: { 'zone_sequence.zone_id': zoneId } });
            }

            pipeline.push({ $count: 'count' });

            const rs = await Session.aggregate(pipeline);
            return rs[0]?.count || 0;
        };

        const visitsCurrent = await getZoneVisits(matchCurrent, true);
        const visitsPrevious = await getZoneVisits(matchPrevious, true);

        const totalCurrentAll = await getZoneVisits(matchCurrent, false);
        const totalPreviousAll = await getZoneVisits(matchPrevious, false);

        const currentPercent = totalCurrentAll > 0
            ? (visitsCurrent / totalCurrentAll) * 100
            : 0;

        const previousPercent = totalPreviousAll > 0
            ? (visitsPrevious / totalPreviousAll) * 100
            : 0;

        return {
            totalDailyTraffic: calcTrend(totalCurrent, totalPrevious),

            currentCustomers: {
                value: currentCustomers
            },

            averageStopTime: calcTrend(
                Math.round(avgCurrent / 60),
                Math.round(avgPrevious / 60)
            ),

            areaPerformance: calcTrend(
                Math.round(currentPercent),
                Math.round(previousPercent)
            ),

            lastUpdated: new Date()
        };

    } catch (error) {
        logger.error('Error getting area management metrics:', error);
        throw error;
    }
};

// Lấy lưu lượng biến động theo giờ (hourly traffic) của khu vực, lọc theo locationIds, zoneId, startDate, endDate
const getHourlyTraffic = async (locationIds, zoneId, startDate, endDate) => {
    const locationFilter = locationIds && locationIds.length > 0
        ? { location_id: { $in: locationIds } }
        : {};
    const match = {
        ...locationFilter,
        $or: [
            { entry_time: { $gte: startDate, $lte: endDate } },
            { 'zone_sequence.entry_time': { $gte: startDate, $lte: endDate } }
        ]
    };
    const pipeline = [
        { $match: match },
        { $unwind: '$zone_sequence' },
        ...(zoneId ? [{ $match: { 'zone_sequence.zone_id': zoneId } }] : []),
        {
            $project: {
                hour: {
                    $dateToString: {
                        format: '%Y-%m-%d %H:00',
                        date: '$zone_sequence.entry_time',
                        timezone: '+07:00'
                    }
                }
            }
        },
        {
            $group: {
                _id: '$hour',
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                hour: '$_id',
                count: 1,
                _id: 0
            }
        }
    ];
    return await Session.aggregate(pipeline);
};

// Lấy tuyến đường di chuyển phổ biến giữa các zone và độ tin cậy
const getMovementPaths = async (locationIds, fromZoneId, toZoneId, startDate, endDate) => {
    const locationFilter = locationIds && locationIds.length > 0
        ? { location_id: { $in: locationIds } }
        : {};
    const match = {
        ...locationFilter,
        $or: [
            { entry_time: { $gte: startDate, $lte: endDate } },
            { 'zone_sequence.entry_time': { $gte: startDate, $lte: endDate } }
        ]
    };
    const pipeline = [
        { $match: match },
        { $unwind: '$zone_sequence' },
        { $sort: { session_uuid: 1, 'zone_sequence.entry_time': 1 } },
        {
            $group: {
                _id: '$_id',
                session_uuid: { $first: '$session_uuid' },
                zones: { $push: '$zone_sequence.zone_id' }
            }
        },
        {
            $project: {
                pairs: {
                    $zip: {
                        inputs: [
                            { $slice: ['$zones', 0, { $subtract: [{ $size: '$zones' }, 1] }] },
                            { $slice: ['$zones', 1, { $size: '$zones' }] }
                        ]
                    }
                }
            }
        },
        { $unwind: '$pairs' },
        {
            $project: {
                fromZoneId: { $arrayElemAt: ['$pairs', 0] },
                toZoneId: { $arrayElemAt: ['$pairs', 1] }
            }
        },
        ...(fromZoneId ? [{ $match: { fromZoneId } }] : []),
        ...(toZoneId ? [{ $match: { toZoneId } }] : []),
        {
            $group: {
                _id: { fromZoneId: '$fromZoneId', toZoneId: '$toZoneId' },
                count: { $sum: 1 }
            }
        }
    ];
    const totalFromPipeline = [
        { $match: match },
        { $unwind: '$zone_sequence' },
        ...(fromZoneId ? [{ $match: { 'zone_sequence.zone_id': fromZoneId } }] : []),
        {
            $group: {
                _id: '$zone_sequence.zone_id',
                total: { $sum: 1 }
            }
        }
    ];
    const [pairs, totals] = await Promise.all([
        Session.aggregate(pipeline),
        Session.aggregate(totalFromPipeline)
    ]);
    const totalMap = {};
    for (const t of totals) totalMap[t._id] = t.total;
    const Zone = require('../schemas/zone.schema');
    const zoneIds = Array.from(new Set([
        ...pairs.map(p => p._id.fromZoneId),
        ...pairs.map(p => p._id.toZoneId)
    ])).filter(Boolean);
    const zones = await Zone.find({ zone_id: { $in: zoneIds } });
    const zoneNameMap = {};
    for (const z of zones) zoneNameMap[z.zone_id] = z.zone_name;
    return pairs.map(p => ({
        from: zoneNameMap[p._id.fromZoneId] || p._id.fromZoneId,
        to: zoneNameMap[p._id.toZoneId] || p._id.toZoneId,
        fromZoneId: p._id.fromZoneId,
        toZoneId: p._id.toZoneId,
        confidence: totalMap[p._id.fromZoneId] ? Math.round((p.count / totalMap[p._id.fromZoneId]) * 1000) / 10 : 0
    }));
};

// Lấy trạng thái chi tiết từng khu vực (zone), lọc theo locationIds, zoneId, startDate, endDate
const getZoneDetails = async (locationIds, zoneId, startDate, endDate) => {
    const locationFilter = locationIds && locationIds.length > 0
        ? { location_id: { $in: locationIds } }
        : {};
    // Lọc zone nếu có zoneId
    const Zone = require('../schemas/zone.schema');
    const zoneQuery = { ...locationFilter };
    if (zoneId) zoneQuery.zone_id = zoneId;
    const zones = await Zone.find(zoneQuery);
    const zoneIds = zones.map(z => z.zone_id);
    // Lấy dữ liệu hôm nay
    const matchToday = {
        ...locationFilter,
        $or: [
            { entry_time: { $gte: startDate, $lte: endDate } },
            { 'zone_sequence.entry_time': { $gte: startDate, $lte: endDate } }
        ]
    };
    // Lấy dữ liệu hôm qua
    const { start: prevStart, end: prevEnd } = getPreviousRange(startDate, endDate);
    const matchYesterday = {
        ...locationFilter,
        $or: [
            { entry_time: { $gte: prevStart, $lte: prevEnd } },
            { 'zone_sequence.entry_time': { $gte: prevStart, $lte: prevEnd } }
        ]
    };
    // Số người hiện tại (sessions chưa có exit_time, group theo zone cuối cùng)
    const currentAgg = await Session.aggregate([
        { $match: { ...locationFilter, exit_time: null } },
        { $unwind: '$zone_sequence' },
        { $sort: { 'zone_sequence.entry_time': 1 } },
        {
            $group: {
                _id: '$_id',
                lastZone: { $last: '$zone_sequence.zone_id' }
            }
        },
        { $group: { _id: '$lastZone', count: { $sum: 1 } } }
    ]);
    const currentMap = {};
    for (const c of currentAgg) currentMap[c._id] = c.count;
    // Số người hôm nay, hôm qua, thời gian dừng TB hôm nay
    const [todayAgg, yesterdayAgg, dwellAgg] = await Promise.all([
        Session.aggregate([
            { $match: matchToday },
            { $unwind: '$zone_sequence' },
            { $group: { _id: '$zone_sequence.zone_id', count: { $sum: 1 } } }
        ]),
        Session.aggregate([
            { $match: matchYesterday },
            { $unwind: '$zone_sequence' },
            { $group: { _id: '$zone_sequence.zone_id', count: { $sum: 1 } } }
        ]),
        Session.aggregate([
            { $match: matchToday },
            { $unwind: '$zone_sequence' },
            {
                $group: {
                    _id: '$zone_sequence.zone_id',
                    avgDwell: { $avg: '$zone_sequence.dwell_time_seconds' }
                }
            }
        ])
    ]);
    const todayMap = {}, yesterdayMap = {}, dwellMap = {};
    for (const t of todayAgg) todayMap[t._id] = t.count;
    for (const y of yesterdayAgg) yesterdayMap[y._id] = y.count;
    for (const d of dwellAgg) dwellMap[d._id] = d.avgDwell;
    return zones.map(z => ({
        zoneId: z.zone_id,
        zoneName: z.zone_name,
        cameraId: z.camera_id,
        currentCount: currentMap[z.zone_id] || 0,
        todayCount: todayMap[z.zone_id] || 0,
        diff: todayMap[z.zone_id] - (yesterdayMap[z.zone_id] || 0),
        avgDwellTime: dwellMap[z.zone_id] ? Math.round((dwellMap[z.zone_id] || 0) / 60) : 0 // phút
    }));
};

module.exports = {
    getAreaManagementMetrics,
    getHourlyTraffic,
    getMovementPaths,
    getZoneDetails
};