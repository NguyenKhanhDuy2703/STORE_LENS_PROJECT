const logger = require("../utils/logging");
const sessionSchema = require("../schemas/session.schema");
const interactionLogSchema = require("../schemas/interactionLog.schema");
const zoneSchema = require("../schemas/zone.schema");
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
    for (const sessionData of inforSessions) {
       const currentTrackId = sessionData.split('_').pop();
       const userData = data.filter(item => String(item.track_id) === currentTrackId);
       await sessionWorker.processInteraction({ session_uuid : sessionData, location_id, data: userData });
       await sessionWorker.updateSessionDwellTime({ session_uuid : sessionData, location_id });
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
              entry_time: new Date(),
              camera_id: camera_id,
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
        inforSessions.push(sessionData.session_uuid);
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
            asset_id: assetInZone.asset_id,
            event_type: item.event_type,
            start_time: item.timestamp,
            last_heartbeat: new Date(),
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
    const now = new Date();
    switch (event) {
        case "ENTRY":
            await sessionSchema.findOneAndUpdate(
                { session_uuid: sessionUUID, location_id },
                { 
                    $push: { 
                        zone_sequence: { 
                            zone_id: zone_id, 
                            entry_time: now,
                            exit_time: null,
                            dwell_time_seconds: 0
                        } 
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
                    const dwellTime = Math.floor((now - lastZone.entry_time) / 1000);
                    await sessionSchema.updateOne(
                        { session_uuid: sessionUUID, "zone_sequence._id": lastZone._id },
                        { 
                            $set: { 
                                "zone_sequence.$.exit_time": now,
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
