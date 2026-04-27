const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes/index.route");
const morganMiddleware = require("./middlewares/morgan.middleware");
const config = require("./config");
const logger = require("./utils/logging");
const handleException = require("./utils/exceptions");
const worker = require("./worker");
const http = require("http")
const {port , corsOption , name} = config.getConfig().app;
const { socketIo: socketOptions } = config.getConfig();
const app = express();
const server = http.createServer(app)
const connection = require("./config/databaseMonogo");
const socketIo = require("socket.io")
const io = socketIo(server, socketOptions)
app.set("io" , io)
app.use(morganMiddleware)
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true  , limit: '50mb'}));
app.use(cors(corsOption));
app.options('*', cors(corsOption)); // handle preflight cho tất cả routes
app.use(cookieParser());
const startWorker = async () => {
    try {
        const io = app.get("io")
        await worker.connection(io);
        await connection();
    } catch (error) {
        logger.error(`Error starting worker: ${error.message}`);
        throw error;
    }
};
io.on('connection' , (socket) => {
    logger.info(`[Socket] New client connected | id=${socket.id} | transport=${socket.conn.transport.name}`);

    socket.conn.on('upgrade', (transport) => {
        logger.info(`[Socket] Transport upgraded | id=${socket.id} | transport=${transport.name}`);
    });

    socket.on('join_location', (locationId) => {
        socket.join(locationId);
        logger.info(`[Socket] Client joined room | id=${socket.id} | locationId=${locationId}`);
    });

    socket.on('disconnect', (reason) => {
        logger.info(`[Socket] Client disconnected | id=${socket.id} | reason=${reason}`);
    });

    socket.on('error', (err) => {
        logger.error(`[Socket] Socket error | id=${socket.id} | error=${err.message}`);
    });
})
routes(app);
app.use(handleException);

module.exports = {server , startApp : startWorker}