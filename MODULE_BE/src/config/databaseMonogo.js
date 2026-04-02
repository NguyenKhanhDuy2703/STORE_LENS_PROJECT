const mongoose = require('mongoose');
const config = require('../config');
const {error} = require("../utils/response")
const logger = require("../utils/logging")
const { StatusCodes } = require("http-status-codes");
const mongoURI = config.getConfig().database.mongoURI;
const maskedURI = mongoURI.replace(/\/\/.*:.*@/, '//***:***@');
logger.info(`MongoDB URI: ${maskedURI}`);

const connection = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      logger.info(`Attempting MongoDB connection (attempt ${retryCount + 1}/${maxRetries})...`);
      
      await mongoose.connect(mongoURI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        dbName: 'spacelens'
      });

      if (mongoose.connection.readyState === 1) {
        logger.info('✓ Connected to MongoDB successfully');
        try {
          const collections = await mongoose.connection.db.listCollections().toArray();
          const collectionNames = collections.map(col => col.name);
          logger.info(`✓ Available Collections: ${collectionNames.join(', ')}`);
        } catch (listErr) {
          logger.warn(`Could not list collections: ${listErr.message}`);
        }
      }
      return mongoose.connection;
    } catch (e) {
      retryCount++;
      
      if (e.code === 'ECONNREFUSED' || e.name === 'MongoServerSelectionError') {
        logger.error(`Connection attempt failed: ${e.message}`);
        
        if (retryCount < maxRetries) {
          const waitTime = 1000 * Math.pow(2, retryCount - 1); // exponential backoff
          logger.info(`Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return connectWithRetry();
        }
      }
      
      throw e;
    }
  };

  try {
    return await connectWithRetry();
  } catch (e) {
    logger.error(`MongoDB Connection Error: ${e.message}`);
    logger.error(`Error Details: ${JSON.stringify({
      code: e.code,
      name: e.name,
      syscall: e.syscall,
      hostname: e.hostname
    }, null, 2)}`);
    
    error({
      message: 'Failed to connect to MongoDB',
      code: StatusCodes.SERVICE_UNAVAILABLE,
      errors: e.message
    });
    process.exit(1);
  }
}


module.exports = connection;