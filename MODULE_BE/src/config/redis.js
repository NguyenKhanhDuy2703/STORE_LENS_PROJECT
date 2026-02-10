const { createClient } = require('redis');
const config = require('../config')
const redisUrl = `redis://${config.redis.host || 'localhost'}:6379`;
const redisClient = createClient({
    url: redisUrl
});
redisClient.on('error', (err) => console.error(' Redis Client Error:', err));
redisClient.on('connect', () => console.log(' Redis connecting...'));
redisClient.on('ready', () => console.log(' Redis Client Ready'));
const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis connected successfully');
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