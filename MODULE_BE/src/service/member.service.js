const Session = require('../schemas/session.schema');
const BusinessEvent = require('../schemas/businessEvent.schema');
const { ApiError } = require('../utils/exceptions');
const httpStatus = require('http-status-codes');

const SEGMENT_RULES = [
    {
        tag: "LOYAL_MEMBER",
        label: "Loyal Member",
        minVisits: 10,
        minDwellTime: 45,
        minSpending: 2000000,
        priority: 1
    },
    {
        tag: "POTENTIAL_MEMBER",
        label: "Potential Member",
        minVisits: 3,
        minDwellTime: 20,
        minSpending: 500000,
        priority: 2
    },
    {
        tag: "OCCASIONAL_VISITOR",
        label: "Occasional Visitor",
        minVisits: 0,
        minDwellTime: 0,
        minSpending: 0,
        priority: 3
    }
];

const SEGMENT_LABELS = {
  LOYAL_MEMBER: 'Khách thân thiết',
  POTENTIAL_MEMBER: 'Khách tiềm năng',
  OCCASIONAL_VISITOR: 'Khách vãng lai'
};

const validateInput = (locationId) => {
  if (!locationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Location ID is required');
  }
};

/* Get aggregated session data with zone insights */
const getRawSessionData = async (locationId) => {
  return await Session.aggregate([
    { $match: { location_id: locationId } },
    { $project: { person_id: 1, session_uuid: 1, total_dwell_time_seconds: 1, entry_time: 1, zone_sequence: 1 } },
    { $unwind: { path: "$zone_sequence", preserveNullAndEmptyArrays: true } },
    { $lookup: { from: "zones", localField: "zone_sequence.zone_id", foreignField: "zone_id", as: "zoneInfo" } },
    { $unwind: { path: "$zoneInfo", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { person_id: "$person_id", session_uuid: "$session_uuid" },
        totalDwellSeconds: { $first: "$total_dwell_time_seconds" },
        entryTime: { $first: "$entry_time" },
        zoneEntries: { $push: { zoneName: "$zoneInfo.zone_name", durationSeconds: "$zone_sequence.dwell_time_seconds" } }
      }
    },
    {
      $group: {
        _id: "$_id.person_id",
        totalVisits: { $sum: 1 },
        totalDwellSeconds: { $sum: { $ifNull: ["$totalDwellSeconds", 0] } },
        lastVisit: { $max: "$entryTime" },
        zoneEntries: { $push: "$zoneEntries" },
        recentVisits: { $sum: { $cond: { if: { $gte: ["$entryTime", { $dateSubtract: { startDate: "$$NOW", unit: "day", amount: 30 } }] }, then: 1, else: 0 } } }
      }
    },
    {
      $project: {
        totalVisits: 1,
        totalDwellSeconds: 1,
        lastVisit: 1,
        zoneEntries: { $reduce: { input: "$zoneEntries", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
        recentVisits: 1
      }
    }
  ]);
};

/* Calculate total spending per person from BusinessEvents */
const calculateSpending = async (locationId) => {
  const spendingData = await BusinessEvent.aggregate([
    { $match: { location_id: locationId } },
    { $lookup: { from: "sessions", localField: "event_code", foreignField: "session_uuid", as: "session" } },
    { $unwind: { path: "$session", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$session.person_id", totalSpending: { $sum: "$total_amount" } } }
  ]);

  const spendingMap = {};
  spendingData.forEach(item => spendingMap[item._id] = item.totalSpending);
  return spendingMap;
};

/* Process raw data into member objects */
const processMembers = (rawData, spendingMap) => {
  const processedMembers = rawData.map(member => {
    const avgDwellMinutes = (member.totalDwellSeconds / member.totalVisits) / 60;
    const spending = spendingMap[member._id] || 0;

    const zoneTotals = {};
    (member.zoneEntries || []).forEach(entry => {
      if (!entry || !entry.zoneName || !entry.durationSeconds) return;
      zoneTotals[entry.zoneName] = (zoneTotals[entry.zoneName] || 0) + entry.durationSeconds;
    });

    const matchedRule = SEGMENT_RULES.find(rule =>
      member.totalVisits >= rule.minVisits &&
      avgDwellMinutes >= rule.minDwellTime &&
      spending >= rule.minSpending
    ) || SEGMENT_RULES[SEGMENT_RULES.length - 1];

    return {
      _id: `USR-${member._id.toString().slice(-4)}`,
      memberCode: member._id.toString().slice(-4),
      name: null,
      segmentName: SEGMENT_LABELS[matchedRule.tag] || matchedRule.label,
      chestShoulder: zoneTotals['Khu tập ngực - vai'] ? Math.round(zoneTotals['Khu tập ngực - vai'] / 60) : 0,
      back: zoneTotals['Khu tập lưng'] ? Math.round(zoneTotals['Khu tập lưng'] / 60) : 0,
      legsGlutes: zoneTotals['Khu tập chân - mông'] ? Math.round(zoneTotals['Khu tập chân - mông'] / 60) : 0,
      visitsPerMonth: member.recentVisits,
      dwellTime: `${Math.round(avgDwellMinutes)} phút`,
      note: "Automatically categorized by system rules."
    };
  });
  return processedMembers;
};

/* Calculate segment summaries */
const calculateSegments = (processedMembers, spendingMap) => {
  return SEGMENT_RULES.map(rule => {
    const membersForTag = processedMembers.filter(m => m.segmentName === (SEGMENT_LABELS[rule.tag] || rule.label));
    const totalSpend = membersForTag.reduce((sum, item) => sum + (spendingMap[item._id] || 0), 0);
    return {
      _id: rule.tag,
      segmentName: SEGMENT_LABELS[rule.tag] || rule.label,
      memberCount: membersForTag.length,
      avgSpend: membersForTag.length ? Math.round(totalSpend / membersForTag.length) : 0
    };
  }).filter(seg => seg.memberCount > 0);
};

const buildOverview = (processedMembers) => {
  return {
    totalMembers: processedMembers.length,
    loyalCount: processedMembers.filter(m => m.segmentName === 'Khách thân thiết').length,
    potentialCount: processedMembers.filter(m => m.segmentName === 'Khách tiềm năng').length,
    returningRate: processedMembers.length > 0
      ? ((processedMembers.filter(m => m.visitsPerMonth > 1).length / processedMembers.length) * 100).toFixed(2)
      : 0
  };
};

const getMemberSegmentation = async (locationId) => {
  validateInput(locationId);

  const [rawData, spendingMap] = await Promise.all([
    getRawSessionData(locationId),
    calculateSpending(locationId)
  ]);
  const processedMembers = processMembers(rawData, spendingMap);
  const segments = calculateSegments(processedMembers, spendingMap);
  const overview = buildOverview(processedMembers);

  return { members: processedMembers, overview, segments };
};

module.exports = {
  getMemberSegmentation
};
