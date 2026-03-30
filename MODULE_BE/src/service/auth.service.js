const userModel = require("../schemas/user.schema");
const locationModel = require("../schemas/allocation.schema");
const { error } = require("../utils/response");
const { hashPassword, comparePassword } = require("../utils/hashpassword");
const { renderToken } = require("../utils/handleToken");

const register = async (userData) => {
    const { account, password, email, location_id, fullname } = userData;
<<<<<<< HEAD
    // 1. Logic kiểm tra trùng lặp
    const isExisting = await userModel.findOne({ $or: [{ account }, { email }] });
    if (isExisting) error("Tài khoản hoặc Email đã tồn tại", 400);
    // 2. Logic kiểm tra Location
    const location = await locationModel.findById(location_id);
    if (!location) error("Địa điểm không tồn tại", 404);
    // 3. Hash mật khẩu và lưu
    const hashedPassword = await hashPassword(password);
=======
    
    // Validate input
    const trimmedAccount = account.toString().trim();
    const trimmedEmail = email.toString().trim();
    const trimmedPassword = password.trim();
    
    const isExisting = await userModel.findOne({ $or: [{ account: trimmedAccount }, { email: trimmedEmail }] });
    if (isExisting) error({message : "Account and Email is exist", code : StatusCodes.BAD_REQUEST})
    
    const location = await locationModel.findById(location_id);
    if (!location) error({message: "The locations is not exist ", code: StatusCodes.BAD_REQUEST});
    
    const hashedPassword = await hashPassword(trimmedPassword);
>>>>>>> d9e048f ([MODULE_BE] feat : add testcase auth (login , logout , register ) , fix : auth.controller (use trim() remove space ))
    const newUser = await userModel.create({
        account: trimmedAccount,
        password: hashedPassword,
        email: trimmedEmail,
        fullname: fullname ? fullname.toString().trim() : undefined,
        location_id: location_id.toString(),
        role: 'MANAGER'
    });
    return { id: newUser._id, account: newUser.account, location: location.name };
};
const login = async (account, password) => {
<<<<<<< HEAD
    const user = await userModel.findOne({ account: account.trim() });
    if (!user || !(await comparePassword(password.trim(), user.password))) {
        error("Tài khoản hoặc mật khẩu không đúng", 401);
=======
    // Type validation for non-string credentials
    if (typeof account !== "string" || typeof password !== "string") {
        error({message: "Missing values", code: StatusCodes.BAD_REQUEST});
    }
    
    // Check for empty strings after trim
    const trimmedAccount = account.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedAccount || !trimmedPassword) {
        error({message: "Missing values", code: StatusCodes.BAD_REQUEST});
    }
    
    const user = await userModel.findOne({ account: trimmedAccount });
    if (!user || !(await comparePassword(trimmedPassword, user.password))) {
        error({message: "Incorrect account or password", code : StatusCodes.UNAUTHORIZED});
>>>>>>> d9e048f ([MODULE_BE] feat : add testcase auth (login , logout , register ) , fix : auth.controller (use trim() remove space ))
    }
    const token = renderToken({
        id: user._id,
        role: user.role,
        location_id: user.location_id
    });
    return {
        token,
        user: { 
            _id: user._id,
            account: user.account, 
            email: user.email,
            role: user.role, 
            location_id: user.location_id 
        }
    };
};

module.exports = { register, login };