const logger = require("../utils/logging");
const sessionSchema = require("../schemas/session.schema");
const interactionLogSchema = require("../schemas/interactionLog.schema");
const zoneSchema = require("../schemas/zone.schema");
const {getCurrnetDateVN} = require("../utils/date.util");
const sessionWorker = {
  async save(payload = {}) {
    if (!payload || typeof payload !== "object") {
      logger.warn("Skipping session save because payload is missing or malformed.");
      return;
    }

    const { data, infor } = payload;
    if (!data || !Array.isArray(data) || !infor || !infor.camera_id || !infor.location_id) {
      logger.warn(`Invalid session payload structure: ${JSON.stringify(payload)}`);
      return;
    }

    const { camera_id, location_id } = infor;
    const inforSessions = await sessionWorker.processSession({
      data,
      infor,
      camera_id,
      location_id,
    });
    for (const sessionInfo of inforSessions) {
       const { session_uuid, track_id } = sessionInfo;
       const userData = data.filter(item => String(item.track_id) === track_id);
       // Cộng dwell_time trực tiếp từ payload (không phụ thuộc asset/zone)
       await sessionWorker.addDwellTimeToSession({ session_uuid, location_id, data: userData });
       // Lưu interactionLog để track tương tác với asset (nếu zone có asset)
       await sessionWorker.processInteraction({ session_uuid, location_id, data: userData });
    }
    
  },
  async processSession({ data, camera_id, location_id }) {
    try {
        const inforSessions = [];
      for (const item of data) {
        const sessionUUID = `${location_id}_${camera_id}_${item.track_id}`;
        const sessionData = await sessionSchema.findOneAndUpdate(
          {
            session_uuid: sessionUUID,
            location_id: location_id,
          },
          {
            $setOnInsert: {
              entry_time: getCurrnetDateVN(),
              location_id: location_id,
              session_uuid: sessionUUID,
              total_dwell_time_seconds: 0,
            },
          },
          {
            upsert: true,
            new: true,
          },
        );
        inforSessions.push({ session_uuid: sessionData.session_uuid, track_id: String(item.track_id) });
      }
      return inforSessions;
    } catch (error) {
      throw error;
    }
  },
  async processInteraction({ session_uuid, location_id, data }) {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return;
        }

        const zoneIds = [...new Set(data.map(item => item.zone_id))];
        const zones = await zoneSchema.find({ zone_id: { $in: zoneIds } });
        const zoneMap = new Map(zones.map(z => [z.zone_id, z.asset_id]));
      for (const item of data) {
        const assetInZone = zoneMap.get(item.zone_id);
        if (assetInZone) {
          await interactionLogSchema.create({
            session_uuid: session_uuid,
            location_id: location_id,
            zone_id: item.zone_id,
            asset_id: assetInZone,
            event_type: item.event_type,
            start_time: item.timestamp,
            last_heartbeat: getCurrnetDateVN(),
            duration_seconds: item.dwell_time,
            status: "active",
          });
        }
      }
    } catch (error) {
      throw error;
    }
  },
  async updateSessionDwellTime({ session_uuid, location_id }) {
    try {
      const totalDwellTime = await interactionLogSchema.aggregate([
        {
          $match: {
            session_uuid: session_uuid,
            location_id: location_id,
            event_type: "stop",
          },
        },
        {
          $group: {
            _id: "$session_uuid",
            totalDwellTime: { $sum: "$duration_seconds" },
          },
        },
      ]);
      if (totalDwellTime.length > 0) {
        await sessionSchema.findOneAndUpdate(
          { 
            session_uuid: session_uuid, 
            location_id: location_id 
          },
          { total_dwell_time_seconds: totalDwellTime[0].totalDwellTime },
        );
      }
    } catch (error) {
      throw error;
    }
  },
  async processZoneEvent({ data, infor }) {
    return this.updateZoneSequence({ data, infor });
  },
  /**
   * Cộng dwell_time từ AI payload trực tiếp vào session — không phụ thuộc interactionLog hay asset.
   * Đảm bảo tính đủ thời gian dừng kể cả ngoài zone hoặc zone chưa gán asset.
   */
  async addDwellTimeToSession({ session_uuid, location_id, data }) {
    try {
      if (!Array.isArray(data) || data.length === 0) return;
      const totalDwell = data
        .filter(item => item.event_type === "stop" && item.dwell_time > 0)
        .reduce((sum, item) => sum + item.dwell_time, 0);
      if (totalDwell <= 0) return;
      await sessionSchema.findOneAndUpdate(
        { session_uuid, location_id },
        { $inc: { total_dwell_time_seconds: totalDwell } }
      );
    } catch (error) {
      throw error;
    }
  },
  async updateZoneSequence(payload = {}) {
    if (!payload || typeof payload !== "object") {
      logger.warn("Skipping zone sequence update because payload is missing or malformed.");
      return;
    }

    const { data, infor } = payload;
    if (!data || !infor || !infor.camera_id || !infor.location_id) {
      logger.warn(`Invalid zone update payload structure: ${JSON.stringify(payload)}`);
      return;
    }

    const { camera_id, location_id } = infor;
    const { track_id, event, zone_id, from_zone_id, to_zone_id } = data || {};
    const sessionUUID = `${location_id}_${camera_id}_${track_id}`;
    switch (event) {
        case "ENTRY":
            await sessionSchema.findOneAndUpdate(
                { session_uuid: sessionUUID, location_id },
                { 
                    $push: { 
                        zone_sequence: { 
                            zone_id: zone_id, 
                            entry_time: getCurrnetDateVN(),
                            exit_time: null,
                            dwell_time_seconds: 0
                        } 
                    },
                    $setOnInsert: {
                        entry_time: getCurrnetDateVN(),
                        total_dwell_time_seconds: 0
                    }
                },
                { upsert: true }
            );
            break;

        case "EXIT":
            const session = await sessionSchema.findOne({ session_uuid: sessionUUID });
            if (session && Array.isArray(session.zone_sequence) && session.zone_sequence.length > 0) {
                const lastZone = session.zone_sequence[session.zone_sequence.length - 1];
                if (lastZone.zone_id === zone_id && !lastZone.exit_time) {
                  const now = getCurrnetDateVN();
                    const dwellTime = Math.floor((now - lastZone.entry_time) / 1000);
                    await sessionSchema.updateOne(
                        { session_uuid: sessionUUID, "zone_sequence._id": lastZone._id },
                        { 
                            $set: { 
                                "zone_sequence.$.exit_time": getCurrnetDateVN(),
                                "zone_sequence.$.dwell_time_seconds": dwellTime
                            } 
                        }
                    );
                }
            }
            break;

        case "TRANSITION":
            if (from_zone_id) {
                await this.processZoneEvent({ 
                    data: { track_id, event: "EXIT", zone_id: from_zone_id }, 
                    infor 
                });
            }
            if (to_zone_id) {
                await this.processZoneEvent({ 
                    data: { track_id, event: "ENTRY", zone_id: to_zone_id }, 
                    infor 
                });
            }
            break;
        default:
            logger.warn(`Unhandled zone event type: ${event}`);
    }
  }
};

module.exports = sessionWorker;
