const express = require('express'); 
const router = express.Router();
const {version} = require("../config").getConfig().api;
const {error , success} =  require("../utils/response")
const {StatusCodes } = require("http-status-codes")
const authRoutes = require("./auth.routes");
const { authenticationToken, authenticationRole } = require("../middlewares/auth.middleware");
const routes = (app) => {

     router.get("/", (req, res) => {
        return success(res, null, "StoreLens API is working perfectly", StatusCodes.OK);
    });
    router.use("/auth", authRoutes);
    router.get(
        "/getToken",
        authenticationToken,
        authenticationRole(["admin", "manager"]),
        (req, res) => {
            return success(res, { user: req.user }, "Lấy thông tin người dùng từ Token thành công");
        }
    );
   

    app.use(version, router);
}
module.exports = routes;