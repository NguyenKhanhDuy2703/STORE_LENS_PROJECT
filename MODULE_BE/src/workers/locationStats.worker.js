const locationStats = require("../schemas/locationStats.schema");
const Session = require("../schemas/session.schema");
const BusinessEvent = require("../schemas/businessEvent.schema");
const locationStatsSchema = require("../schemas/locationStats.schema");
const {dateUtil} = require("../utils/date.util");
const moment = require('moment-timezone');

const locationStatsWorker = {
  async process(locationId) {
    const { startDate: today, endDate: nextDay } = dateUtil({ type: "today" });

    // Upsert document cho ngày hôm nay nếu chưa có
    await locationStats.updateOne(
      {
        location_id: locationId,
        date: { $gte: today, $lte: nextDay },
      },
      {
        $setOnInsert: {
          location_id: locationId,
          date: today,
          kpis: {
            total_visitors: 0,
            total_revenue: 0,
          },
          realtime: {
            people_current: 0,
            checkout_length: 0,
          },
          chart_data: [],
          top_assets: [],
        },
      },
      {
        upsert: true,
      },
    );
    const resutls = await Promise.allSettled([
      this.kpisProcessor({ locationId, today, nextDay }),
      this.chartDataProcessor({ locationId, today, nextDay }),
      this.topAssetsProcessor({ locationId, today, nextDay }),
    ]).catch((err) => {
      console.error("Error processing location stats:", err);
    });
    for (const result of resutls) {
      if (result instanceof Error) {
        console.error("Error processing location stats:", result);
        throw result;
      }    
    }
    
  },
  async kpisProcessor({ locationId, today, nextDay }) {
    // FIX: Lấy ngày hôm nay ở timezone Việt Nam
    const todayDateString = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    
    const totalVisitorsAgg = await Session.aggregate([
      {
        $match: {
          location_id: locationId
        }
      },
      {
        // Convert entry_time sang ngày ở timezone Việt Nam
        $project: {
          entry_date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$entry_time",
              timezone: "Asia/Ho_Chi_Minh"
            }
          }
        }
      },
      {
        // Chỉ lấy những session vào hôm nay
        $match: {
          entry_date: todayDateString
        }
      },
      {
        $count: "total_visitors"
      }
    ]);
    
    const totalVisitors = totalVisitorsAgg[0]?.total_visitors || 0;

    const totalRevenueAgg = await BusinessEvent.aggregate([
      {
        $match: {
          location_id: locationId,
          date: { $gte: today, $lte: nextDay },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
          totalEvents: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalEvents = totalRevenueAgg[0]?.totalEvents || 0;
    const conversionRate =
      totalVisitors > 0
        ? Number(((totalEvents / totalVisitors) * 100).toFixed(2))
        : 0;
    const avgBasketValue =
      totalEvents > 0 ? Number((totalRevenue / totalEvents).toFixed(2)) : 0;

    // ── Tính người vẫn còn ở (Session chưa exit) ──────────────────────────
    const peopleStillInStore = await Session.countDocuments({
      location_id: locationId,
      entry_time: {
        $gte: today,
        $lte: nextDay
      },
      exit_time: null  // Chưa rời
    });

    // ── Tính trung bình thời gian dừng (avg_store_dwell_time) ──────────────────────────
    const avgDwellTimeAgg = await Session.aggregate([
      {
        $match: {
          location_id: locationId,
          entry_time: {
            $gte: today,
            $lte: nextDay
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDwellTime: { $avg: "$total_dwell_time_seconds" }
        }
      }
    ]);
    const avgStoreDwellTime = avgDwellTimeAgg[0]?.avgDwellTime || 0;

    await locationStatsSchema.updateOne(
      { location_id: locationId, date: { $gte: today, $lte: nextDay } },
      {
        $set: {
          "kpis.total_visitors": totalVisitors,
          "kpis.total_revenue": totalRevenue,
          "kpis.total_events": totalEvents,
          "kpis.conversion_rate": conversionRate,
          "kpis.avg_basket_value": avgBasketValue,
          "kpis.avg_store_dwell_time": avgStoreDwellTime,
          // Fallback: nếu realtime chưa update → dùng Session.exit_time = null
          "realtime.people_current": peopleStillInStore,
        },
      },
      { upsert: true },
    );
  },
  async chartDataProcessor({ locationId, today, nextDay }) {
  const todayDateString = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
  
  const [dataRevenue, dataTracking] = await Promise.all([
    BusinessEvent.aggregate([
      { $match: { location_id: locationId, date: { $gte: today, $lte: nextDay } } },
      {
        $group: {
          _id: { $hour: { date: "$date", timezone: "Asia/Ho_Chi_Minh" } },
          bill_count: { $sum: 1 }, 
          total_revenue: { $sum: "$total_amount" }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { _id: 0, hour: "$_id", bill_count: 1, total_revenue: 1 } }
    ]),
    Session.aggregate([
      { $match: { location_id: locationId } },
      {
        $project: {
          entry_hour: {
            $hour: {
              date: "$entry_time",
              timezone: "Asia/Ho_Chi_Minh"
            }
          },
          entry_date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$entry_time",
              timezone: "Asia/Ho_Chi_Minh"
            }
          }
        }
      },
      {
        $match: {
          entry_date: todayDateString
        }
      },
      {
        $group: {
          _id: "$entry_hour",
          visitor_count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { _id: 0, hour: "$_id", visitor_count: 1 } }
    ])
  ]);
  const chart24h = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    people_count: 0, 
    total_revenue: 0 
  }));
  dataTracking.forEach(item => {
    if (chart24h[item.hour]) {
      chart24h[item.hour].people_count = item.visitor_count;
    }
  });
  dataRevenue.forEach(item => {
    if (chart24h[item.hour]) {
      chart24h[item.hour].total_revenue = item.total_revenue;
    }
  });
  await locationStatsSchema.updateOne(
    { location_id: locationId, date: { $gte: today, $lte: nextDay } },
    { 
      $set: { chart_data: chart24h } 
    },
    { upsert: true } 
  );
},
  async topAssetsProcessor({ locationId, limit = 5, today, nextDay }) {
    const topAssetsAgg = await BusinessEvent.aggregate([
      {
        $match: {
          location_id: locationId,
          date: { $gte: today, $lte: nextDay },
        },
      },
      { $unwind: "$event_details" },
      {
        $group: {
          _id: "$event_details.item_id",
          asset_name: { $first: "$event_details.item_name" },
          total_quantity: { $sum: "$event_details.quantity" },
          total_revenue: { $sum: "$event_details.total_price" },
        },
      },

      { $sort: { total_revenue: -1 } },
    ]);
    await locationStats.updateOne(
      { location_id: locationId, date: { $gte: today, $lte: nextDay } },
      {
        $set: {
          top_assets: topAssetsAgg
            .map((item, index) => ({
              asset_id: item._id,
              asset_name: item.asset_name,
              total_quantity: item.total_quantity,
              total_revenue: item.total_revenue,
              rank: index + 1,
            }))
            .slice(0, limit),
        },
      },
    );
  },
};
module.exports = locationStatsWorker;
