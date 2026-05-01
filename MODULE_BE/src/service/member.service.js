const Customer = require('../schemas/customer.schema');
const CustomerCareRule = require('../schemas/customerCareRule.schema');

// Tính metric của customer theo tên metric (dùng chung với ruleCustomer.worker)
const getMetricValue = (customer, metricName) => {
    const now = Date.now();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    switch (metricName) {
        case 'total_sessions':
            return customer.totalSessions ?? 0;
        case 'days_since_last_visit':
            if (!customer.lastVisit) return null;
            return Math.floor((now - new Date(customer.lastVisit).getTime()) / MS_PER_DAY);
        case 'days_since_join':
            if (!customer.joinDate) return null;
            return Math.floor((now - new Date(customer.joinDate).getTime()) / MS_PER_DAY);
        case 'visits_last_30_days': {
            if (!Array.isArray(customer.history)) return 0;
            const cutoff = new Date(now - 30 * MS_PER_DAY);
            return customer.history.filter((h) => h.date && new Date(h.date) >= cutoff).length;
        }
        default:
            return null;
    }
};

const evaluate = (value, operator, threshold) => {
    switch (operator) {
        case '>':  return value > threshold;
        case '<':  return value < threshold;
        case '>=': return value >= threshold;
        case '<=': return value <= threshold;
        default:   return false;
    }
};
const getMemberMetrics = async (locationId) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [result] = await Customer.aggregate([
        { $match: { locationId } },
        {
            $group: {
                _id: null,
                totalMembers: { $sum: 1 },
                newMembersThisMonth: {
                    $sum: { $cond: [{ $gte: ['$joinDate', monthStart] }, 1, 0] }
                },
                absentMembers: {
                    $sum: {
                        $cond: [
                            { $or: [{ $lt: ['$lastVisit', weekAgo] }, { $eq: ['$lastVisit', null] }] },
                            1, 0
                        ]
                    }
                }
            }
        }
    ]);

    const total = result?.totalMembers || 0;
    const absent = result?.absentMembers || 0;

    return {
        totalMembers: total,
        newMembersThisMonth: result?.newMembersThisMonth || 0,
        absenteeismRate: total > 0 ? Number(((absent / total) * 100).toFixed(2)) : 0
    };
};

// Lấy danh sách hội viên với filter search/status
const getMemberList = async (locationId, filters = {}) => {
    const { search, status } = filters;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const matchQuery = { locationId };
    if (status) matchQuery.status = status;
    if (search) {
        matchQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } }
        ];
    }

    return await Customer.aggregate([
        { $match: matchQuery },
        { $sort: { joinDate: -1 } },
        {
            $project: {
                id: '$_id',
                code: 1,
                name: 1,
                phone: 1,
                birthday: 1,
                totalSessions: { $ifNull: ['$totalSessions', 0] },
                lastVisit: 1,
                status: 1,
                note: { $ifNull: ['$note', ''] },
                sessionsThisMonth: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$history', []] },
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
                // Khách đang check-in hôm nay (có check_in, chưa check_out)
                isCheckedIn: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$history', []] },
                                    as: 'h',
                                    cond: {
                                        $and: [
                                            { $gte: ['$$h.date', today] },
                                            { $ne: ['$$h.check_in', null] },
                                            { $eq: ['$$h.check_out', null] }
                                        ]
                                    }
                                }
                            }
                        },
                        0
                    ]
                }
            }
        }
    ]);
};

// Lấy chi tiết một hội viên theo code
const getMemberDetail = async (locationId, memberCode) => {
    const customer = await Customer.findOne({ locationId, code: memberCode }).lean();

    if (!customer) {
        const err = new Error('Member not found');
        err.statusCode = 404;
        throw err;
    }

    // Tính trạng thái dựa trên lastVisit
    const now = new Date();
    const lastVisit = customer.lastVisit;
    const diffDays = lastVisit ? (now - lastVisit) / (1000 * 60 * 60 * 24) : Infinity;

    let status = 'inactive';
    if (diffDays <= 7) status = 'absent-short';
    if (diffDays > 7) status = 'absent-long';

    // Kiểm tra đang check-in hôm nay (check_in hôm nay, chưa check_out)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const todayVisit = (customer.history || []).find(
        (h) => h.date >= todayStart && h.date < todayEnd && h.check_in && !h.check_out
    );
    if (todayVisit) status = 'active';

    // Trả về 5 lần ghé gần nhất
    const recentVisits = (customer.history || [])
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((h) => ({
            date: h.date?.toISOString().split('T')[0],
            checkIn: h.check_in,
            checkOut: h.check_out
        }));

    // Tìm các rules của location khớp với hội viên này (chỉ retention + revenue)
    const rules = await CustomerCareRule.find({
        location_id: locationId,
        category: { $in: ['retention', 'revenue'] },
        is_active: true
    }).lean();

    const matchedRules = rules
        .filter((rule) => {
            const metricName = rule.logic?.metric_name || rule.logic?.metricName;
            const value = getMetricValue(customer, metricName);
            if (value === null) return false;
            return evaluate(value, rule.logic.operator, rule.logic.threshold);
        })
        .map((rule) => ({
            ruleName: rule.rule_name,
            action: rule.action,
            category: rule.category
        }));

    return { ...customer, status, recentVisits, matchedRules };
};

// Tạo mới hoặc cập nhật hội viên theo code (upsert)
const saveOrUpdateMember = async (locationId, memberData) => {
    const { code, phone, name, birthday } = memberData;

    if (!code) {
        const err = new Error('code is required');
        err.statusCode = 400;
        throw err;
    }

    // Kiểm tra phone trùng với hội viên khác (không phải chính nó)
    if (phone) {
        const phoneConflict = await Customer.findOne({ phone, code: { $ne: code } });
        if (phoneConflict) {
            const err = new Error('Phone already used by another member');
            err.statusCode = 400;
            throw err;
        }
    }

    const result = await Customer.findOneAndUpdate(
        { locationId, code },
        { $set: { ...memberData, locationId } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return result;
};

// Xóa hội viên theo code
const deleteMember = async (locationId, memberCode) => {
    const result = await Customer.findOneAndDelete({ locationId, code: memberCode });

    if (!result) {
        const err = new Error('Member not found');
        err.statusCode = 404;
        throw err;
    }

    return { code: memberCode };
};

module.exports = { getMemberMetrics, getMemberList, getMemberDetail, saveOrUpdateMember, deleteMember };
