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
<<<<<<< HEAD
=======
const startWorker = async () => {
    // Skip worker initialization in test environment
    if (process.env.NODE_ENV === 'test') {
        logger.info('Skipping worker initialization in test environment');
        return;
    }
    try{
        await worker.connection()
    }catch(error){
        logger.error(`Error starting worker: ${error.message}`);
    }
}
startWorker();
>>>>>>> d9e048f ([MODULE_BE] feat : add testcase auth (login , logout , register ) , fix : auth.controller (use trim() remove space ))

routes(app);
app.use(handleException)

module.exports = app