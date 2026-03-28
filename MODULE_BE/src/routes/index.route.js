const { version } = require("../config").getConfig().api;
const { error, success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

// Route Imports
const authRoutes = require("./auth.routes");
const cameraAIRoutes = require("./cameraAI.routes");
const dashboardRoutes = require('./dashboard.routes');

// Middleware Imports
const { 
  authenticationToken, 
  authenticationRole, 
  ALLOWED_ALL 
} = require("../middlewares/auth.middleware");

const routes = (app) => {
  app.get(`${version}/`, (req, res) => {
    return success(res, null, "StoreLens API is working perfectly", StatusCodes.OK);
  });

  app.get(`${version}/healthy`, (req, res) => {
    try {
      return success(res, null, "API is healthy", StatusCodes.OK);
    } catch (e) {
      return error(res, "Health check failed", StatusCodes.INTERNAL_SERVER_ERROR, [e.message]);
    }
  });


  app.use(`${version}/auth`, authRoutes);
  app.use(`${version}/camera`, cameraAIRoutes);
  app.use(`${version}/dashboard`, dashboardRoutes);

  app.get(
    `${version}/gettoken`, 
    authenticationToken, 
    authenticationRole(['admin', 'manager']),
    (req, res) => {
      return success(
        res, 
        { user: req.user }, 
        "User information extracted from token successfully"
      );
    }
  );
};

module.exports = routes;