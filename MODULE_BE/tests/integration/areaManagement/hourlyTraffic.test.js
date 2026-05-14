const ZoneStatsSchema = require("../../../src/schemas/zoneStats.schema");
const { getAreaHourlyTraffic } = require("../../../src/service/areaManagement.service");
const { dateUtil } = require("../../../src/utils/date.util");

const buildZoneStats = async ({ locationId, zoneId, hourlyTraffic }) => {
  const { startDate } = dateUtil({ type: "today" });
  return ZoneStatsSchema.create({
    location_id: locationId,
    zone_id: zoneId,
    date: startDate,
    performance: {
      people_count: 0,
      total_sales_value: 0,
      total_events: 0,
      conversion_rate: 0,
      avg_dwell_time: 0,
      total_stop_events: 0,
      top_asset_id: null,
      peak_hour: null,
    },
    hourly_traffic: hourlyTraffic,
  });
};

describe("getAreaHourlyTraffic service", () => {
  const LOCATION_ID = "LOC_CLEAN_001";

  test("returns zone hourly traffic when zoneId is provided", async () => {
    await buildZoneStats({
      locationId: LOCATION_ID,
      zoneId: "ZONE_A",
      hourlyTraffic: [
        { hour: "9:00", count: 2 },
        { hour: "10:00", count: 1 },
      ],
    });

    const result = await getAreaHourlyTraffic({
      locationId: LOCATION_ID,
      zoneId: "ZONE_A",
      type: "today",
    });

    expect(result.hourly).toEqual([
      { hour: "9:00", count: 2 },
      { hour: "10:00", count: 1 },
    ]);
    expect(result.lastUpdated).toBeInstanceOf(Date);
  });

  test("aggregates hourly traffic across zones when zoneId is missing", async () => {
    await buildZoneStats({
      locationId: LOCATION_ID,
      zoneId: "ZONE_A",
      hourlyTraffic: [
        { hour: "9:00", count: 2 },
        { hour: "10:00", count: 1 },
      ],
    });

    await buildZoneStats({
      locationId: LOCATION_ID,
      zoneId: "ZONE_B",
      hourlyTraffic: [
        { hour: "9:00", count: 3 },
        { hour: "11:00", count: 4 },
      ],
    });

    const result = await getAreaHourlyTraffic({
      locationId: LOCATION_ID,
      type: "today",
    });

    expect(result.hourly).toEqual([
      { hour: "9:00", count: 5 },
      { hour: "10:00", count: 1 },
      { hour: "11:00", count: 4 },
    ]);
  });

  test("returns empty hourly array when no zone stats exist", async () => {
    const result = await getAreaHourlyTraffic({
      locationId: "LOC_EMPTY",
      type: "today",
    });

    expect(result.hourly).toEqual([]);
    expect(result.lastUpdated).toBeInstanceOf(Date);
  });
});
