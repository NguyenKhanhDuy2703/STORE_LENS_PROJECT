require("dotenv").config();
class setting {
  constructor() {
    if (setting.instance) return setting.instance;
    this.app = {
      name: process.env.APP_NAME || "spaceLens",
      port: process.env.PORT || 5000,
      env: process.env.NODE_ENV || "development",
      corsOption: {
        origin: ["http://localhost:5173", "http://172.20.176.1:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      },
    };
    this.database = {
      mongoURI: process.env.URI_MONGODB ,
    };
    this.redis = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
    };

    this.cookie = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || this.app.env === 'production',
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, 
    };
    
    this.apiAI = {
      port: process.env.PORT_AI,
    };
    this.api = {
        version: "/api/v1",
    },
    this.cloudinary = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    this.socketIo = {
      cors: {
        origin: ["http://localhost:5173", "http://172.20.176.1:5173"],
        methods: ["GET", "POST"],
        credentials: true,
      }
    }
  
    setting.instance = this;
  }
  getConfig() {
    return {
      app: this.app,
      database: this.database,
      redis: this.redis,
      api : this.api,
      apiAI : this.apiAI,
      cloudinary: this.cloudinary,
      socketIo : this.socketIo
    };
  }
}

module.exports = new setting();
