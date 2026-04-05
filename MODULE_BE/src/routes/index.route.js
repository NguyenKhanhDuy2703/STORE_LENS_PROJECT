const { version } = require("../config").getConfig().api;
const { error, success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");
const authRoutes = require("./auth.routes");
const cameraAIRoutes = require("./cameraAI.routes");
const dashboardRoutes = require("./dashboard.routes");
const areaManagementRoutes = require("./areaManagement.routes");

const {
  authenticationToken,
  ALLOWED_ALL,
} = require("../middlewares/auth.middleware");
const routes = (app) => {
  
  app.use(`${version}/auth`, authRoutes);
  app.use(`${version}/camera`, cameraAIRoutes);
  app.use(`${version}/dashboard`, dashboardRoutes);
  app.use(`${version}/area-management`, areaManagementRoutes);


  app.get(`${version}/gettoken`, authenticationToken, ALLOWED_ALL, (req, res) => {
    return success(
      res,
      { user: req.user },
      "get token successfully",
    );
  });
  app.get(`${version}/healthy`, (req, res) => {
    try {
      success({
        res,
        message: "API is healthy",
        code: StatusCodes.OK,
      });
    } catch (e) {
      error({
        message: "Health check failed",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
        errors: [e.message],
      });
    }
  });
};
module.exports = routes;
