const app = require("./app");
const config = require("./config");
const logger = require("./utils/logging");
const connection = require("./config/databaseMonogo");

const { port, name } = config.getConfig().app;

connection().then(() => {
  app.listen(port, () => {
    logger.info(`${name} is running on port ${port}`);
    logger.info(`http://localhost:${port}`);
  });
}).catch(() => {
  process.exit(1);
});