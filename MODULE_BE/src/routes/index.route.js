const { version } = require("../config").getConfig().api;
const { error, success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const authRoutes = require("./auth.routes");
const cameraAIRoutes = require("./cameraAI.routes");
const dashboardRoutes = require("./dashboard.routes");
const areaManagementRoutes = require("./areaManagement.routes");
const asynLocationRoutes = require("./asyn.routes");
const memberRoutes = require("./member.routes");
const heatmapRoutes = require("./heatmap.routes");
const zoneRoutes = require("./zone.routes");
const configRuleRoutes = require("./customerConfigrule.routes");
const locationRoutes = require("./allocation.routes");
const assetRoutes = require("./asset.routes");
const notificationRoutes = require("./notification.routes");
const dwellTimeRoutes = require("./dwelltime.routes");
const flowPatternsRoutes = require("./flowPatterns.routes");
const {
  authenticationToken,
  ALLOWED_ALL,
  ALLOWED_MANAGER,
  ALLOWED_ADMIN
} = require("../middlewares/auth.middleware");
const routes = (app) => {
  
  app.use(`${version}/auth`, authRoutes);
  app.use(`${version}/camera`, cameraAIRoutes);
  app.use(`${version}/member`, memberRoutes);
  app.use(`${version}/dashboard`, dashboardRoutes);
  app.use(`${version}/area-management`, areaManagementRoutes);
  app.use(`${version}/async` , asynLocationRoutes);
  app.use(`${version}/heatmap` , heatmapRoutes);
  app.use(`${version}/zone` , zoneRoutes);
  app.use(`${version}/customer-config-rule` , configRuleRoutes);
  app.use(`${version}/location`, locationRoutes);
  app.use(`${version}/asset` , assetRoutes);
  app.use(`${version}/notification`, notificationRoutes);
  app.use(`${version}/dwell-time`, dwellTimeRoutes);
  app.use(`${version}/flow-patterns`, flowPatternsRoutes);
  app.get(`${version}/gettoken`, authenticationToken, ALLOWED_ALL, (req, res) => {
    return success({
      res,
      message: "Get current session successfully",
      code: StatusCodes.OK,
      data: req.user || null
    }
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
