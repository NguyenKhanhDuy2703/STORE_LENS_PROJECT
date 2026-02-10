const mongoose = require('mongoose');
const config = require('../config');
const mongoURI = config.getConfig().database.mongoURI;
const connection  = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize : 10 ,
      minPoolSize : 5 , 
      socketTimeoutMS : 45000,

    });
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB connected');
    }
    return mongoose.connection;
  }
  catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}


module.exports = connection;