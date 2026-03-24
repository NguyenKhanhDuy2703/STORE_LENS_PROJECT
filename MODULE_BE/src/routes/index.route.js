const express = require("express");
const router = express.Router();
const { version } = require("../config").getConfig().api;
const { error, success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");
const authRoutes = require("./auth.routes");
const {
  authenticationToken,
  ALLOWED_ALL,
} = require("../middlewares/auth.middleware");
const routes = (app) => {
  router.get("/", (req, res) => {
    return success(
      res,
      null,
      "StoreLens API is working perfectly",
      StatusCodes.OK,
    );
  });
  router.use("/auth", authRoutes);
  router.get("/getToken", authenticationToken, ALLOWED_ALL, (req, res) => {
    return success(
      res,
      { user: req.user },
      "get token successfully",
    );
  });

  app.use(version, router);
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
