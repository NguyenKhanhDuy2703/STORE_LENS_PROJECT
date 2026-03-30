const authService = require("../service/auth.service"); 
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const logger = require("../utils/logging");
const config = require("../config");
const { StatusCodes } = require("http-status-codes");
const _CheckRequiredFields = (fields, types) => {
    switch (types) {
        case "register":
            if (!fields.account || !fields.password || !fields.email || !fields.location_id) {
                error({message: "Missing values", code: StatusCodes.BAD_REQUEST});
            }
            break;
        case "login":
            if (!fields.account || !fields.password) {
                error({message: "Missing values", code: StatusCodes.BAD_REQUEST});
            }
            break;
    }
}
const registerController = catchAsync(async (req, res) => {
    const { account, password, email, location_id } = req.body;
    _CheckRequiredFields({ account, password, email, location_id }, "register");

    const result = await authService.register(req.body);
    return success({ res, data: { id: result.id, account: result.account, location: result.location }, message: "register successfully", code: StatusCodes.CREATED });
});

const loginController = catchAsync(async (req, res) => {
    const { account, password } = req.body;
    _CheckRequiredFields({ account, password }, "login");
    const result = await authService.login(account, password);
    res.cookie("sessionToken", result.token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure, 
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
    });
    return success({ res, data: { user: result.user }, message: "signin successfully", code: StatusCodes.OK }); 
});

const logoutController = catchAsync(async (req, res) => {
    res.clearCookie("sessionToken");
    return success({ res, message: "logout successfully", code: StatusCodes.OK });
});

module.exports = { registerController, loginController, logoutController }