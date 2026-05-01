const mongoose = require('mongoose');
const Customer = require('../schemas/customer.schema');
const httpStatus = require('http-status-codes');

/**
 * Get Metrics - Use Aggregate to calculate dashboard metrics
 */
const getMemberMetrics = async (locationId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const metrics = await Customer.aggregate([
    { $match: { locationId } },
    {
      $group: {
        _id: null,
        totalMembers: { $sum: 1 },
        newMembersThisMonth: {
          $sum: {
            $cond: [{ $gte: ['$joinDate', monthStart] }, 1, 0]
          }
        },
        absentMembers: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $lt: ['$lastVisit', weekAgo] },
                  { $eq: ['$lastVisit', null] }
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

  const result = metrics[0] || {};
  const total = result.totalMembers || 0;
  const absent = result.absentMembers || 0;
  const absenteeismRate = total > 0 ? Number(((absent / total) * 100).toFixed(2)) : 0;

  return {
    totalMembers: total,
    newMembersThisMonth: result.newMembersThisMonth || 0,
    absenteeismRate
  };
};

/**
 * Get List - Use Aggregate + $project to optimize data returned for FE
 */
const getMemberList = async (locationId, filters = {}) => {
  const { search, status } = filters;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let query = { locationId };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  return await Customer.aggregate([
    { $match: query },
    { $sort: { joinDate: -1 } },
    {
      $project: {
        id: '$_id',
        code: { $ifNull: ['$code', { $toUpper: { $substr: [{ $toString: '$_id' }, -6, 6] } }] },
        name: { $ifNull: ['$name', { $concat: ['Customer ', '$code'] }] },
        phone: { $ifNull: ['$phone', null] },
        birthday: { $ifNull: ['$birthday', null] },
        sessionsThisMonth: {
          $size: {
            $filter: {
              input: '$history',
              as: 'h',
              cond: {
                $and: [
                  { $gte: ['$$h.date', monthStart] },
                  { $lt: ['$$h.date', nextMonthStart] }
                ]
              }
            }
          }
        },
        totalSessions: { $ifNull: ['$totalSessions', 0] },
        status: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$history',
                      as: 'h',
                      cond: {
                        $and: [
                          { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$$h.date' } }, { $dateToString: { format: '%Y-%m-%d', date: today } }] },
                          { $ne: ['$$h.check_in', null] },
                          { $eq: ['$$h.check_out', null] },
                          { $lte: ['$$h.check_in', now] }
                        ]
                      }
                    }
                  }
                },
                0
              ]
            },
            then: 'active',
            else: 'inactive'
          }
        },
        note: { $ifNull: ['$note', ''] }
      }
    }
  ]);
};

/**
 * Get Member Detail 
 */
const getMemberDetail = async (locationId, personId) => {
  const query = {
    locationId,
    $or: [{ code: personId }, { phone: personId }]
  };

  if (mongoose.Types.ObjectId.isValid(personId)) {
    query.$or.unshift({ _id: personId });
  }

  const pipeline = [
    { $match: query },
    {
      $project: {
        id: '$_id',
        code: { $ifNull: ['$code', { $toUpper: { $substr: [{ $toString: '$_id' }, -6, 6] } }] },
        name: '$name',
        phone: { $ifNull: ['$phone', null] },
        status: 'active', 
        recentVisits: {
          $slice: [
            {
              $sortArray: {
                input: {
                  $map: {
                    input: '$history',
                    as: 'h',
                    in: {
                      date: { $dateToString: { format: '%Y-%m-%d', date: '$$h.date' } },
                      checkIn: '$$h.check_in',
                      checkOut: '$$h.check_out'
                    }
                  }
                },
                sortBy: { date: -1 }
              }
            },
            5
          ]
        },
        frequentZones: { $ifNull: ['$frequentZones', []] },
        note: { $ifNull: ['$note', ''] },
        lastVisit: 1,
        history: 1
      }
    }
  ];

  const customer = await Customer.aggregate(pipeline).then(results => results[0]);

  if (!customer) {
    const err = new Error('Member not found');
    err.statusCode = httpStatus.NOT_FOUND;
    throw err;
  }

  // Calculate status
  const now = new Date();
  const lastVisit = customer.lastVisit || (customer.recentVisits[0] ? new Date(customer.recentVisits[0].date) : null);
  const diffDays = lastVisit ? (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24) : Infinity;
  let status = 'inactive';
  if (diffDays <= 7) {
    status = 'absent-short';
  } else if (diffDays > 7) {
    status = 'absent-long';
  }
  const todayStr = now.toISOString().split('T')[0];
  const todayVisit = customer.recentVisits.find(v => v.date === todayStr);
  if (todayVisit && todayVisit.checkIn && !todayVisit.checkOut) {
    status = 'active';
  }
  customer.status = status;

  return customer;
};

/**
 * Create/Update Member
 * Ensure data matches Schema: locationId, code, name, phone, birthday are required
 */
const createOrUpdateMember = async (locationId, memberData) => {
  const { code, phone } = memberData;

  if (memberData.id || code) {
    const updated = await Customer.findOneAndUpdate(
      { locationId, $or: [{ _id: memberData.id }, { code: code }] },
      { $set: memberData },
      { new: true, runValidators: true }
    );
    if (!updated) {
      const err = new Error('Member not found');
      err.statusCode = httpStatus.NOT_FOUND;
      throw err;
    }
    return updated;
  }

  // If creating new member
  const existing = await Customer.findOne({ $or: [{ code }, { phone }] });
  if (existing) {
    const err = new Error('Member code or phone already exists');
    err.statusCode = httpStatus.BAD_REQUEST;
    throw err;
  }

  return await Customer.create({ ...memberData, locationId });
};

/**
 * Delete Member
 */
const deleteMember = async (locationId, memberId) => {
  const result = await Customer.findOneAndDelete({ _id: memberId, locationId });
  if (!result) {
    const err = new Error('Member not found or unauthorized to delete');
    err.statusCode = httpStatus.NOT_FOUND;
    throw err;
  }
  return { message: 'Delete successful', id: memberId };
};

module.exports = {
  getMemberMetrics,
  getMemberList,
  getMemberDetail,
  createOrUpdateMember,
  deleteMember
};