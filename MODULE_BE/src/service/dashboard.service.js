const LocationStatModel = require('../schemas/locationStats.schema');
const BusinessEventModel = require('../schemas/businessEvent.schema');
const SessionModel = require('../schemas/session.schema');
const { error } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');


const toObjectId = (id) => {
  if (!id) return null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id; 
};


const getDashboardStats = async (location_id) => {
  if (!location_id) {
    return error({
      message: 'location_id must be provided',
      code: StatusCodes.BAD_REQUEST
    });
  }

  const locationObjectId = toObjectId(location_id);

  console.log('Raw location_id:', location_id);
  console.log('Converted location_id:', locationObjectId);

  const latestStat = await LocationStatModel
    .findOne({ location_id: locationObjectId })
    .sort({ date: -1 })
    .lean();

  console.log('LocationStat found:', latestStat);

  if (latestStat) {
    return {
      location_id,
      total_revenue: latestStat.kpis?.total_revenue || 0,
      total_visitors: latestStat.kpis?.total_visitors || 0,
      conversion_rate: latestStat.kpis?.conversion_rate || 0,
      people_current: latestStat.realtime?.people_current || 0,
      checkout_length: latestStat.realtime?.checkout_length || 0,
      updated_at: latestStat.updated_at || latestStat.date || null,
      source: 'location_stats'
    };
  }

  console.log('No LocationStat → fallback to events/sessions');

  const sampleEvent = await BusinessEventModel.findOne().lean();
  const sampleSession = await SessionModel.findOne().lean();

  console.log('Sample BusinessEvent:', sampleEvent);
  console.log('Sample Session:', sampleSession);

  const [revenueAgg] = await BusinessEventModel.aggregate([
    {
      $match: {
        location_id: locationObjectId,
        type: 'PURCHASE',
        status: 'COMPLETED'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total_amount' },
        countPurchase: { $sum: 1 }
      }
    }
  ]);

  const totalVisitors = await SessionModel.countDocuments({
    location_id: locationObjectId
  });

  const peopleCurrent = await SessionModel.countDocuments({
    location_id: locationObjectId,
    exit_time: { $exists: false }
  });

  const totalPurchaseEvents = revenueAgg?.countPurchase || 0;
  const totalRevenue = revenueAgg?.totalRevenue || 0;

  const conversionRate =
    totalVisitors > 0
      ? Number(((totalPurchaseEvents / totalVisitors) * 100).toFixed(2))
      : 0;

  console.log('FINAL FALLBACK DATA:', {
    totalRevenue,
    totalVisitors,
    totalPurchaseEvents,
    conversionRate,
    peopleCurrent
  });

  return {
    location_id,
    total_revenue: totalRevenue,
    total_visitors: totalVisitors,
    conversion_rate: conversionRate,
    people_current: peopleCurrent,
    checkout_length: 0,
    updated_at: new Date(),
    source: 'fallback'
  };
};


const getAllDashboardStats = async () => {
  // ưu tiên lấy từ LocationStat nếu có
  const locationStats = await LocationStatModel.find({}).lean();

  if (locationStats.length > 0) {
    const sum = locationStats.reduce(
      (acc, item) => {
        acc.total_revenue += item.kpis?.total_revenue || 0;
        acc.total_visitors += item.kpis?.total_visitors || 0;
        acc.total_events += item.kpis?.total_events || 0;
        acc.people_current += item.realtime?.people_current || 0;
        acc.checkout_length += item.realtime?.checkout_length || 0;
        return acc;
      },
      { total_revenue: 0, total_visitors: 0, total_events: 0, people_current: 0, checkout_length: 0 }
    );

    const conversion_rate = sum.total_visitors > 0 ? Number(((sum.total_events / sum.total_visitors) * 100).toFixed(2)) : 0;

    return {
      total_revenue: sum.total_revenue,
      total_visitors: sum.total_visitors,
      conversion_rate,
      people_current: sum.people_current,
      checkout_length: sum.checkout_length,
      updated_at: new Date(),
      source: 'location_stats_aggregate'
    };
  }

  // fallback tổng hợp từ business event + session nếu chưa có locationStats
  const [eventAgg, visitorCount, peopleCurrent] = await Promise.all([
    BusinessEventModel.aggregate([
      { $match: { type: 'PURCHASE', status: 'COMPLETED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total_amount' }, totalPurchases: { $sum: 1 } } }
    ]),
    SessionModel.countDocuments({}),
    SessionModel.countDocuments({ exit_time: { $exists: false } })
  ]);

  const totalRevenue = eventAgg[0]?.totalRevenue || 0;
  const totalPurchases = eventAgg[0]?.totalPurchases || 0;
  const totalVisitors = visitorCount || 0;
  const conversion_rate = totalVisitors > 0 ? Number(((totalPurchases / totalVisitors) * 100).toFixed(2)) : 0;

  return {
    total_revenue: totalRevenue,
    total_visitors: totalVisitors,
    conversion_rate,
    people_current: peopleCurrent,
    checkout_length: 0,
    updated_at: new Date(),
    source: 'fallback_aggregate'
  };
};

const getAvailableLocations = async () => {
  const [businessEventLocations, sessionLocations, locationStatLocations] =
    await Promise.all([
      BusinessEventModel.distinct('location_id'),
      SessionModel.distinct('location_id'),
      LocationStatModel.distinct('location_id')
    ]);

  return {
    businessEvents: businessEventLocations,
    sessions: sessionLocations,
    locationStats: locationStatLocations
  };
};

module.exports = {
  getDashboardStats,
  getAllDashboardStats,
  getAvailableLocations
};