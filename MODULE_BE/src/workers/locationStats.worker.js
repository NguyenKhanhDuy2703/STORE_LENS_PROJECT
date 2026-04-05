const locationStats = require("../schemas/locationStats.schema");
const dateUtil = require("../utils/date.util");
const Session = require("../schemas/session.schema");
const BusinessEvent = require("../schemas/businessEvent.schema");
const locationStatsSchema = require("../schemas/locationStats.schema");
const locationStatsWorker = {
  async process(locationId) {
    const today = dateUtil.getVNStartofDay(new Date());
    const nextDay = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    await locationStats.updateOne(
      {
        location_id: locationId,
        date: today,
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
    // Tính toán KPIs từ dữ liệu Session và BusinessEvent
    const totalVisitors = await Session.countDocuments({
      location_id: locationId,
    });

    const totalRevenueAgg = await BusinessEvent.aggregate([
      {
        $match: {
          location_id: locationId,
          date: { $gte: today, $lt: nextDay },
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

    await locationStatsSchema.updateOne(
      { location_id: locationId, date: today },
      {
        $set: {
          "kpis.total_visitors": totalVisitors,
          "kpis.total_revenue": totalRevenue,
          "kpis.total_events": totalEvents,
          "kpis.conversion_rate": conversionRate,
          "kpis.avg_basket_value": avgBasketValue,
        },
      },
      { upsert: true },
    );
  },
  async chartDataProcessor({ locationId, today, nextDay }) {
  const [dataRevenue, dataTracking] = await Promise.all([
    BusinessEvent.aggregate([
      { $match: { location_id: locationId, date: { $gte: today, $lt: nextDay } } },
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
      { $match: { location_id: locationId, entry_time: { $gte: today, $lt: nextDay } } },
      {
        $group: {
          _id: { $hour: { date: "$entry_time", timezone: "Asia/Ho_Chi_Minh" } },
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
    { location_id: locationId, date: today },
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
          date: { $gte: today, $lt: nextDay },
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
      { location_id: locationId, date: today },
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
