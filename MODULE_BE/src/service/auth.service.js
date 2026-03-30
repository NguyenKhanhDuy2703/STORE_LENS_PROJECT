const userModel = require("../schemas/user.schema");
const locationModel = require("../schemas/location.schema");
const { error } = require("../utils/response");
const { renderToken , comparePassword , hashPassword ,verifyToken } = require("../middlewares/security.middleware");
const { StatusCodes } = require("http-status-codes");


const register = async (userData) => {
    const { account, password, email, location_id, fullname } = userData;

    // Validate input
    const trimmedAccount = account.toString().trim();
    const trimmedEmail = email.toString().trim();
    const trimmedPassword = password.trim();
    
    const isExisting = await userModel.findOne({ $or: [{ account: trimmedAccount }, { email: trimmedEmail }] });
    if (isExisting) error({message : "Account and Email is exist", code : StatusCodes.BAD_REQUEST})
    
    const location = await locationModel.findById(location_id);
    if (!location) error({message: "The locations is not exist ", code: StatusCodes.BAD_REQUEST});
    
    const hashedPassword = await hashPassword(trimmedPassword);
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
    const user = await userModel.findOne({ account: account.trim() });
    if (!user || !(await comparePassword(password.trim(), user.password))) {
        error("Tài khoản hoặc mật khẩu không đúng", 401);

        error({message: "Incorrect account or password", code : StatusCodes.UNAUTHORIZED});

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