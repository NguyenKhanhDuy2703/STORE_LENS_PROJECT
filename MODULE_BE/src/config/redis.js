const { createClient } = require('redis');
const settings = require('../config');
const { redis } = settings.getConfig();
const redisHost = redis.host || 'localhost';
const redisPort = Number(redis.port) || 6379;
const redisUrl = `redis://${redisHost}:${redisPort}`;

const redisClient = createClient({
    url: redisUrl,
    host: redisHost,
    port: redisPort,
});
redisClient.on('error', (err) => console.error(' Redis Client Error:', err));
redisClient.on('connect', () => console.log(' Redis connecting...'));
redisClient.on('ready', () => console.log(' Redis Client Ready'));
const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error(' Could not connect to Redis:', error);
        throw error;
    }
};

module.exports = {
    redisClient,
    connectRedis
};