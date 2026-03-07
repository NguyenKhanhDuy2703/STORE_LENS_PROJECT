const app = require("./app");
const config = require("./config");
const logger = require("./utils/logging");
const {port , name} = config.getConfig().app;
app.listen(port, () => {
  logger.info(`${name} is running on port ${port}`);
  logger.info(`http://localhost:${port}`);
});