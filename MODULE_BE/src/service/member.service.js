const mongoose = require('mongoose');
const Customer = require('../schemas/customer.schema');
const { ApiError } = require('../utils/exceptions');
const httpStatus = require('http-status-codes');

// Validate required locationId parameter and reject invalid values.
const validateInput = (locationId) => {
  if (!locationId || !(typeof locationId === 'string' || mongoose.Types.ObjectId.isValid(locationId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid locationId');
  }
};

// Build date boundaries used across dashboard queries and history checks.
const getPeriodBoundaries = () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return { now, monthStart, nextMonthStart, sevenDaysAgo };
};

// Parse a history entry date safely, returning null on invalid input.
const parseHistoryDate = (historyItem) => historyItem && historyItem.date ? new Date(historyItem.date) : null;

// Summarize history entries for the member, including month sessions and active session state.
const getHistoryStats = (customer, now, monthStart, nextMonthStart) => {
  const history = customer.history || [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let lastVisit = null, totalSessionsThisMonth = 0, activeSessionCount = 0;

  history.forEach((entry) => {
    const visitDate = parseHistoryDate(entry);
    if (!visitDate) return;

    if (!lastVisit || visitDate > lastVisit) lastVisit = visitDate;
    if (visitDate >= monthStart && visitDate < nextMonthStart) totalSessionsThisMonth++;

    const entryDate = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
    if (entryDate.getTime() === today.getTime() && entry.check_in && !entry.check_out && entry.check_in <= now) {
      activeSessionCount = 1;
    }
  });
  return { lastVisit, totalSessionsThisMonth, activeSessionCount };
};

// Build a single member object for the dashboard row.
const buildMemberItem = (customer, historyStats, now) => {
  const customerId = customer._id.toString();
  const code = customer.code || customerId.slice(-6).toUpperCase();
  const activeSessionCount = historyStats.activeSessionCount || 0;
  const monthlySessions = historyStats.totalSessionsThisMonth || 0;
  const status = (customer.status || (activeSessionCount > 0 ? 'ACTIVE' : 'INACTIVE')).toLowerCase();

  return {
    id: customerId,
    code,
    name: customer.name || `Customer ${code}`,
    phone: customer.phone || null,
    birthday: customer.birthday || null,
    sessionsThisMonth: monthlySessions,
    totalSessions: customer.totalSessions || 0,
    status,
    note: customer.note || '',
  };
};

// Create dashboard overview stats from customer list and join date data.
const buildOverview = async (locationId, customers, monthStart, nextMonthStart) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((customer) => {
    const historyStats = getHistoryStats(customer, new Date(), monthStart, nextMonthStart);
    return historyStats.activeSessionCount > 0;
  }).length;

  const absenteeismRate = totalCustomers > 0
    ? Number((((totalCustomers - activeCustomers) / totalCustomers) * 100).toFixed(2))
    : 0;

  return {
    totalMembers: totalCustomers,
    newMembersThisMonth: totalCustomers > 0 ? await Customer.countDocuments({
      locationId,
      joinDate: { $gte: monthStart, $lt: nextMonthStart }
    }) : 0,
    absenteeismRate,
  };
};

// Load dashboard data for all members in a location, including overview and member list.
const getMemberDashboard = async (locationId) => {
  validateInput(locationId);
  const { now, monthStart, nextMonthStart } = getPeriodBoundaries();
  const customers = await Customer.find({ locationId }).lean();
  
  if (!customers || customers.length === 0) {
    return {
      overview: {
        totalMembers: 0,
        newMembersThisMonth: 0,
        absenteeismRate: 0,
      },
      members: [],
    };
  }

  const members = customers.map((customer) => {
    const historyStats = getHistoryStats(customer, now, monthStart, nextMonthStart);
    return buildMemberItem(customer, historyStats, now);
  });

  const overview = await buildOverview(locationId, customers, monthStart, nextMonthStart);
  return {  overview,  members,  };
};

// Load a single member detail by location and identifier, then shape the response for the detail panel.
const getMemberDetail = async (locationId, personId) => {
  validateInput(locationId);

  const query = {
    locationId,
    $or: [  { code: personId },  { phone: personId }  ]
  };

  if (mongoose.Types.ObjectId.isValid(personId)) {  query.$or.unshift({ _id: personId });  }

  const customer = await Customer.findOne(query).lean();

  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Member not found for the requested location');
  }

  const customerId = customer._id.toString();
  const { now, sevenDaysAgo } = getPeriodBoundaries();
  const history = (customer.history || [])
    .map((entry) => ({
      ...entry,
      date: parseHistoryDate(entry),
    }))
    .filter((entry) => entry.date)
    .sort((a, b) => b.date - a.date);

  const recentVisits = history.length > 0 ? history.slice(0, 5).map((entry) => ({
    date: entry.date.toISOString().split('T')[0],
    checkIn: entry.check_in || null,
    checkOut: entry.check_out || null,
  })) : [];

  const activeSessionCount = history.some((entry) => {
    const entryDate = new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return entryDate.getTime() === today.getTime() && entry.check_in && !entry.check_out && entry.check_in <= now;
  });

  const lastVisit = customer.lastVisit || (history[0] ? history[0].date : null);
  const diffDays = lastVisit ? (now.getTime() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24) : Infinity;
  let status = activeSessionCount ? 'active' : 'inactive';
  if (status === 'inactive') {
    status = diffDays > 7 ? 'absent-long' : 'absent-short';
  }

  return {
    id: customerId,
    code: customer.code || customerId.slice(-6).toUpperCase(),
    name: customer.name,
    phone: customer.phone || null,
    status,
    recentVisits,
    frequentZones: customer.frequentZones || [],
    note: customer.note || '',
  };
};

// Create a new member record in the system (TODO: implement).
const createMember = async (locationId, memberData) => {
  // TODO: Implementation pending
  throw new ApiError(httpStatus.NOT_IMPLEMENTED, 'Create member feature coming soon');
};

// Update member note field for quick annotations.
const updateMemberNote = async (locationId, personId, noteText) => {
  validateInput(locationId);

  const query = {
    locationId,
    $or: [{ code: personId }, { phone: personId }]
  };

  if (mongoose.Types.ObjectId.isValid(personId)) {
    query.$or.unshift({ _id: personId });
  }

  const result = await Customer.findOneAndUpdate(
    query,
    { note: noteText || '' },
    { new: true, lean: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Member not found for the requested location');
  }

  return {
    id: result._id.toString(),
    code: result.code,
    name: result.name,
    note: result.note || '',
    message: 'Member note updated successfully'
  };
};

// Update member information like phone, birthday, etc. (TODO: implement).
const updateMember = async (locationId, personId, updateData) => {
  // TODO: Implementation pending
  throw new ApiError(httpStatus.NOT_IMPLEMENTED, 'Update member feature coming soon');
};

// Delete a member record from the system (TODO: implement).
const deleteMember = async (locationId, personId) => {
  // TODO: Implementation pending
  throw new ApiError(httpStatus.NOT_IMPLEMENTED, 'Delete member feature coming soon');
};

module.exports = {
  getMemberDashboard,
  getMemberDetail,
  createMember,
  updateMemberNote,
  updateMember,
  deleteMember
};
