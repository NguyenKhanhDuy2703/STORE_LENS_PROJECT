const Session = require('../schemas/session.schema');
const InteractionLog = require('../schemas/interactionLog.schema');
const { ApiError } = require('../utils/exceptions');
const httpStatus = require('http-status-codes');

/**
 * Phân tích và lấy danh sách hội viên dựa trên dữ liệu Sessions hiện có
 */
const getMemberSegmentation = async (locationId) => {
  // Gộp nhóm theo person_id từ bảng Sessions để tính toán các chỉ số 
  const segmentData = await Session.aggregate([
    { $match: { location_id: locationId } },
    {
      $group: {
        _id: "$person_id",
        total_visits: { $sum: 1 },
        avg_dwell_time: { $avg: "$total_dwell_time_seconds" },
        last_visit: { $max: "$entry_time" },
        sessions: { $push: "$_id" }
      }
    },
    {
      $addFields: {
        // Logic phân loại dựa trên hành vi ghi nhận được
        segment_tag: {
          $cond: {
            if: { $and: [{ $gte: ["$total_visits", 5] }, { $gte: ["$avg_dwell_time", 600] }] },
            then: "VIP",
            else: {
              $cond: {
                if: { $gte: ["$total_visits", 3] },
                then: "LOYAL",
                else: "OCCASIONAL"
              }
            }
          }
        },
        customer_type: {
          $cond: { if: { $gt: ["$total_visits", 1] }, then: "RETURNING", else: "NEW" }
        }
      }
    }
  ]);

  // Tính toán Overview cho Dashboard FE
  const overview = {
    total_members: segmentData.length,
    vip_count: segmentData.filter(m => m.segment_tag === 'VIP').length,
    returning_rate: segmentData.length > 0 
      ? ((segmentData.filter(m => m.customer_type === 'RETURNING').length / segmentData.length) * 100).toFixed(2) 
      : 0
  };

  return { members: segmentData, overview };
};

module.exports = {
  getMemberSegmentation
};