const logger = require("./utils/logging");
const { connectRedis, redisClient } = require("./config/redis");
const heatmapWorker = require("./workers/heatmap.worker");
const sessionWorker = require("./workers/session.worker");
const parseRedisPayload = (rawPayload) => {
    if (rawPayload === undefined || rawPayload === null) {
        return undefined;
    }

    if (typeof rawPayload === "object") {
        return rawPayload;
    }

    if (typeof rawPayload === "string") {
        const payloadString = rawPayload.trim();
        if (!payloadString || payloadString === "undefined") {
            return undefined;
        }

        try {
            return JSON.parse(payloadString);
        } catch (error) {
            return { raw: rawPayload };
        }
    }

    return { raw: rawPayload };
};

const channels_pack = ["heatmap_channel" ,"dwell_time_channel","zone_analysis_event_channel"]
const channels_realtime = ["dwell_time_realtime_channel" , "zone_analysis_channel"]

const worker = {
    connection: async () => {
        logger.info(`Connected to Redis successfully | port: ${redisClient.options.socket.port} - status: ${redisClient.isOpen ? 'open' : 'closed'}`);
        const rtClient = redisClient.duplicate();
        await rtClient.connect();
        worker.realtime(rtClient);
        
        const packClient = redisClient.duplicate();
        await packClient.connect();
        worker.consummer(packClient);
    },
    consummer: async (blockingClient) => {
        while (true) {
            try {
                if (channels_pack.length === 0) {
                    continue;
                }
                const result = await blockingClient.blPop(channels_pack, 0);
                if (!result || !result.element) {
                    continue;
                }
               await worker.packprocessor(result)
            } catch (error) {
                logger.error(`Error consuming : ${error.message}`);
            }
        }
    },
    packprocessor: async (data) => {
        const { key, element } = data;
        const payload = parseRedisPayload(element);
        if (!payload || typeof payload !== "object") {
            logger.warn(`Skipping malformed payload for channel ${key}: ${String(element)}`);
            return;
        }

        switch(key){
            case "heatmap_channel":
               await heatmapWorker.save(payload);
                // logger.info(`Processing heatmap data: ${JSON.stringify(payload)}`);
                break;
            case "dwell_time_channel":
                await sessionWorker.save(payload);
                break;
            case "zone_analysis_event_channel":
                await sessionWorker.updateZoneSequence(payload);
                // logger.info(`Processing zone analysis event data: ${JSON.stringify(payload)}`);
                break;
             default:
                // logger.warn(`Received message from unknown channel: ${key} with payload: ${JSON.stringify(payload)}`);
        }
    },
    rtprocessor: async (data) => {
        const { key, element } = data;
        const payload = parseRedisPayload(element);
        if (!payload || typeof payload !== "object") {
            logger.warn(`Skipping malformed realtime payload for channel ${key}: ${String(element)}`);
            return;
        }

        switch(key){
            case "dwell_time_realtime_channel":
                // logger.info(`Processing dwell time realtime data: ${JSON.stringify(payload)}`);
                break;
             case "zone_analysis_channel":
                // logger.info(`Processing zone analysis realtime data: ${JSON.stringify(payload)}`);
                break;
             default:
                // logger.warn(`Received message from unknown channel: ${key} with payload: ${JSON.stringify(payload)}`);
        }
    },
    realtime: async (rtClient) => {
        while (true){
            try {
                if (channels_realtime.length === 0) {
                    continue;
                }
                const result = await rtClient.blPop(channels_realtime, 0);
                if (!result || !result.element) {
                    continue;
                }
                await worker.rtprocessor(result)
            } catch (error) {
                logger.error(`Error consuming realtime channels: ${error.message}`);
            }
        }
    },
};

module.exports = worker;