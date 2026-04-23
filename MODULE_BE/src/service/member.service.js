const mongoose = require('mongoose');
const User = require('../schemas/user.schema');
const Session = require('../schemas/session.schema');
const InteractionLog = require('../schemas/interactionLog.schema');
const Zone = require('../schemas/zone.schema');
const { ApiError } = require('../utils/exceptions');
const httpStatus = require('http-status-codes');

const MONTHLY_TARGET_SESSIONS = 20;
const DEFAULT_AVATAR = null;

const validateInput = (locationId) => {
  if (!locationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location ID is required');
  }
};

const getPeriodBoundaries = () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { now, monthStart, nextMonthStart, sevenDaysAgo };
};

const getStatusBadge = (lastVisit, activeSessionCount, now) => {
  if (activeSessionCount > 0) {
    return { status: 'ACTIVE', color: 'green', label: 'Active Training' };
  }

  if (!lastVisit) {
    return { status: 'NO_VISITS', color: 'red', label: 'No visits yet' };
  }

  const diffDays = (now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 7) {
    return { status: 'REST_LESS_THAN_7_DAYS', color: 'gold', label: 'Resting < 7 days' };
  }

  return { status: 'REST_MORE_THAN_7_DAYS', color: 'red', label: 'Resting > 7 days' };
};

const buildSuggestion = (sessionCountThisWeek, activeSessionCount) => {
  if (activeSessionCount > 0) {
    return 'Customer is currently training. Continue supporting them.';
  }

  if (sessionCountThisWeek === 0) {
    return 'Customer has not visited this week. Please send a reminder message.';
  }

  if (sessionCountThisWeek < 2) {
    return 'Customer visited less than twice this week. Follow up soon.';
  }

  return 'Customer visited this week. Maintain the current care plan.';
};

const buildMemberItem = (user, sessionStats, now) => {
  const personId = user._id.toString();
  const code = user.memberCode || personId.slice(-6).toUpperCase();
  const lastVisit = sessionStats.lastVisit || null;
  const activeSessionCount = sessionStats.activeSessionCount || 0;
  const monthlySessions = sessionStats.totalSessionsThisMonth || 0;
  const status = getStatusBadge(lastVisit, activeSessionCount, now);

  return {
    customerId: personId,
    customerCode: code,
    name: user.name || user.fullName || user.account || user.email || `Customer ${code}`,
    avatar: user.avatar || DEFAULT_AVATAR,
    contactPhone: user.phone || null,
    birthday: user.birthday || null,
    frequencyText: `${monthlySessions}/${MONTHLY_TARGET_SESSIONS} sessions`,
    sessionsThisMonth: monthlySessions,
    status: status.label,
    statusColor: status.color,
    lastVisit,
    quickNote: user.note || user.comment || '',
  };
};

const buildOverview = async (locationId, customerIds, monthStart, nextMonthStart, sevenDaysAgo, totalCustomers) => {
  const activeCustomerIds = await Session.distinct('person_id', {
    location_id: locationId,
    entry_time: { $gte: sevenDaysAgo },
    person_id: { $in: customerIds }
  });

  const absenteeismRate = totalCustomers > 0
    ? Number((((totalCustomers - activeCustomerIds.length) / totalCustomers) * 100).toFixed(2))
    : 0;

  return {
    totalMembers: totalCustomers,
    newMembersThisMonth: totalCustomers > 0 ? await User.countDocuments({
      role: 'USER',
      location_id: locationId,
      created_at: { $gte: monthStart, $lt: nextMonthStart }
    }) : 0,
    absenteeismRate,
  };
};

const getMemberDashboard = async (locationId) => {
  validateInput(locationId);

  const { now, monthStart, nextMonthStart, sevenDaysAgo } = getPeriodBoundaries();
  const customers = await User.find({ role: 'USER', location_id: locationId }).lean();
  console.log('Customers found:', customers.length, customers.map(c => ({ id: c._id, name: c.name })));
  const customerIds = customers.map(customer => customer._id.toString());

  const sessionStatsList = await Session.aggregate([
    { $match: { location_id: locationId, person_id: { $in: customerIds } } },
    {
      $group: {
        _id: '$person_id',
        totalSessionsThisMonth: {
          $sum: {
            $cond: [
              { $and: [
                { $gte: ['$entry_time', monthStart] },
                { $lt: ['$entry_time', nextMonthStart] }
              ] },
              1,
              0
            ]
          }
        },
        lastVisit: { $max: '$entry_time' },
        activeSessionCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lte: ['$entry_time', now] },
                  {
                    $or: [
                      { $eq: ['$exit_time', null] },
                      { $gt: ['$exit_time', now] }
                    ]
                  }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  console.log('Session stats:', sessionStatsList);

  const sessionStatsMap = sessionStatsList.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  const members = customers.map(user => buildMemberItem(user, sessionStatsMap[user._id.toString()] || {}, now));
  const overview = await buildOverview(locationId, customerIds, monthStart, nextMonthStart, sevenDaysAgo, customers.length);

  return {
    overview,
    members,
  };
};

const getMemberDetail = async (locationId, personId) => {
  validateInput(locationId);

    const userQuery = {
    role: 'USER',
    location_id: locationId,
    $or: [
      { account: personId },
      { email: personId }
    ]
  };

  if (mongoose.Types.ObjectId.isValid(personId)) {
    userQuery.$or.unshift({ _id: personId });
  }

  const user = await User.findOne(userQuery).lean();

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Member not found for the requested location');
  }

  const { now, sevenDaysAgo } = getPeriodBoundaries();
  const sessions = await Session.find({
    location_id: locationId,
    person_id: personId
  })
    .sort({ entry_time: -1 })
    .limit(5)
    .lean();

  const sessionUuids = sessions.map(session => session.session_uuid).filter(Boolean);
  const frequentZones = await InteractionLog.aggregate([
    { $match: { location_id: locationId, session_uuid: { $in: sessionUuids } } },
    { $lookup: { from: 'zones', localField: 'zone_id', foreignField: 'zone_id', as: 'zone' } },
    { $unwind: { path: '$zone', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$zone.zone_name', '$zone_id'] },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 3 }
  ]);

  const recentSessionCount = await Session.countDocuments({
    location_id: locationId,
    person_id: personId,
    entry_time: { $gte: sevenDaysAgo }
  });

  const activeSessionCount = await Session.countDocuments({
    location_id: locationId,
    person_id: personId,
    entry_time: { $lte: now },
    $or: [
      { exit_time: null },
      { exit_time: { $gt: now } }
    ]
  });

  const detail = {
    customerId: user._id.toString(),
    customerCode: user._id.toString().slice(-6).toUpperCase(),
    name: user.name || user.fullName || user.account || user.email,
    contactPhone: user.phone || null,
    birthday: user.birthday || null,
    quickNote: user.note || user.comment || '',
    recentVisits: sessions.map(session => ({
      sessionId: session.session_uuid,
      entryTime: session.entry_time,
      exitTime: session.exit_time,
      date: session.entry_time ? session.entry_time.toISOString().split('T')[0] : null
    })),
    frequentZones: frequentZones.map(zone => ({ name: zone._id, count: zone.count })),
    careSuggestion: buildSuggestion(recentSessionCount, activeSessionCount)
  };

  return detail;
};

module.exports = {
  getMemberDashboard,
  getMemberDetail
};
