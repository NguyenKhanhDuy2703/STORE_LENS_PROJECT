const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/index.route");
const morganMiddleware = require("./middlewares/morgan.middleware");
const config = require("./config");
const logger = require("./utils/logging");
const handleException = require("./utils/exceptions");

const {port , corsOption , name } = config.getConfig().app;
const app = express();
app.use(morganMiddleware)

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true  , limit: '50mb'}));
app.use(cors(corsOption));
app.use(cookieParser());

routes(app);
app.use(handleException)
app.listen(port, () => {
  logger.info(`${name} is running on port ${port}`);
});