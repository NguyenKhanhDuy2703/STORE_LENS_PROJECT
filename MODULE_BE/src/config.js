require("dotenv").config();
class setting {
  constructor() {
    if (setting.instance) return setting.instance;
    this.app = {
      name: process.env.APP_NAME || "spaceLens",
      port: process.env.PORT || 5000,
      env: process.env.NODE_ENV || "development",
      corsOption: {
        origin: ["http://localhost:5173", " http://172.20.176.1:5173"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
      },
    };
    this.database = {
      mongoURI: process.env.MONGO_URI || "",
    };
    this.redis = {
      host: process.env.REDIS_HOST,
    };
    this.apiAI = {
      port: process.env.PORT_AI,
    };
    this.api = {
        version: "/api/v1",
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
    };
  }
}

module.exports = new setting();
