const authService = require("../service/auth.service"); 
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const logger = require("../utils/logging");
const config = require("../config");

<<<<<<< HEAD
const registerController = catchAsync(async (req, res) => {
    const { account, password, email, location_id } = req.body;
    if (!account || !password || !email || !location_id) {
        error("Vui lòng nhập đầy đủ thông tin", 400);
    }

=======
const _CheckRequiredFields = (fields, types) => {
    switch (types) {
        case "register":
            if (!fields.account || !fields.account.toString().trim() || 
                !fields.password || !fields.password.toString().trim() || 
                !fields.email || !fields.email.toString().trim() || 
                !fields.location_id || !fields.location_id.toString().trim()) {
                error({message: "Missing values", code: StatusCodes.BAD_REQUEST});
            }
            break;
        case "login":
            if (!fields.account || !fields.account.toString().trim() || 
                !fields.password || !fields.password.toString().trim()) {
                error({message: "Missing values", code: StatusCodes.BAD_REQUEST});
            }
            break;
        default:
            break;
    }
};

const registerController = catchAsync(async (req, res) => {
    const { account, password, email, location_id } = req.body;
    _CheckRequiredFields({ account, password, email, location_id }, "register");
    
    // Validate that password is a string
    if (typeof password !== "string") {
        error({message: "Password must be a string", code: StatusCodes.BAD_REQUEST});
    }
    
>>>>>>> d9e048f ([MODULE_BE] feat : add testcase auth (login , logout , register ) , fix : auth.controller (use trim() remove space ))
    const result = await authService.register(req.body);

    logger.info(`[Auth] Đăng ký mới thành công: ${result.account}`);

    return success(res, result, "Đăng ký thành công", 201);
});

const loginController = catchAsync(async (req, res) => {
    const { account, password } = req.body;
    if (!account || !password) error("Thiếu tài khoản hoặc mật khẩu", 400);
    const result = await authService.login(account, password);
    res.cookie("sessionToken", result.token, {
        httpOnly: config.cookie.httpOnly,
        secure: config.cookie.secure,   // Tự động nhận diện dev/prod từ config
        sameSite: config.cookie.sameSite,
        maxAge: config.cookie.maxAge,
    });

    logger.info(`[Auth] User đăng nhập: ${account}`);
    
    // 3. Trả về thông tin user cho Frontend (Không cần trả token vì đã có trong Cookie)
    return success(res, { user: result.user }, "Đăng nhập thành công");
});

const logoutController = catchAsync(async (req, res) => {
    res.clearCookie("sessionToken");
    
    logger.info(`[Auth] User đã đăng xuất`);
    return success(res, null, "Đăng xuất thành công");
});

module.exports = { registerController, loginController, logoutController };