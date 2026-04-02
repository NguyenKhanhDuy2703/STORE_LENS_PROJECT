const app = require("./app");
const config = require("./config");
const logger = require("./utils/logging");
const { port, name } = config.getConfig().app;

const startServer = async () => {
  try {
    await app.startApp();
    app.listen(port, () => {
      logger.info(`${name} is running on port ${port}`);
      logger.info(`http://localhost:${port}`);
    });
  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();