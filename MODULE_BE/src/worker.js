const logger = require("./utils/logging");
const { connectRedis, redisClient } = require("./config/redis");
const heatmapWorker = require("./workers/heatmap.worker");
const parseRedisPayload = (rawPayload) => {
    try {
        return JSON.parse(rawPayload);
    } catch (_) {
        return { raw: rawPayload };
    }
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
               await worker.packprocessor(data = result)
            } catch (error) {
                logger.error(`Error consuming heatmap_channel: ${error.message}`);
            }
        }
    },
    packprocessor: async (data) => {
        const { key, element } = data;
        const payload = parseRedisPayload(element);
        switch(key){
            case "heatmap_channel":
                heatmapWorker.save(payload);
                // logger.info(`Processing heatmap data: ${JSON.stringify(payload)}`);
                break;
            case "dwell_time_channel":
                // logger.info(`Processing dwell time data: ${JSON.stringify(payload)}`);
                break;
            case "zone_analysis_event_channel":
                // logger.info(`Processing zone analysis event data: ${JSON.stringify(payload)}`);
                break;
             default:
                // logger.warn(`Received message from unknown channel: ${key} with payload: ${JSON.stringify(payload)}`);
        }
    },
    rtprocessor: async (data) => {
        const { key, element } = data;
        const payload = parseRedisPayload(element);
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
                await worker.rtprocessor(data = result)
            } catch (error) {
                logger.error(`Error consuming realtime channels: ${error.message}`);
            }
        }
    },
};

module.exports = worker;