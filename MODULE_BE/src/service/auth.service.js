const userModel = require("../schemas/user.schema");
const locationModel = require("../schemas/allocation.schema");
const { error } = require("../utils/response");
const { hashPassword, comparePassword } = require("../utils/hashpassword");
const { renderToken } = require("../utils/handleToken");

const register = async (userData) => {
    const { account, password, email, location_id, fullname } = userData;
    // 1. Logic kiểm tra trùng lặp
    const isExisting = await userModel.findOne({ $or: [{ account }, { email }] });
    if (isExisting) error("Tài khoản hoặc Email đã tồn tại", 400);
    // 2. Logic kiểm tra Location
    const location = await locationModel.findById(location_id);
    if (!location) error("Địa điểm không tồn tại", 404);
    // 3. Hash mật khẩu và lưu
    const hashedPassword = await hashPassword(password);
    const newUser = await userModel.create({
        account,
        password: hashedPassword,
        email,
        fullname,
        location_id,
        role: 'MANAGER'
    });
    return { id: newUser._id, account: newUser.account, location: location.name };
};
const login = async (account, password) => {
    const user = await userModel.findOne({ account: account.trim() });
    if (!user || !(await comparePassword(password.trim(), user.password))) {
        error("Tài khoản hoặc mật khẩu không đúng", 401);
    }
    const token = renderToken({
        id: user._id,
        role: user.role,
        location_id: user.location_id
    });
    return {
        token,
        user: { account: user.account, role: user.role, location_id: user.location_id }
    };
};

module.exports = { register, login };