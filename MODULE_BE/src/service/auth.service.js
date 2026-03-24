const userModel = require("../schemas/user.schema");
const locationModel = require("../schemas/location.schema");
const { error } = require("../utils/response");
const { renderToken , comparePassword , hashPassword ,verifyToken } = require("../middlewares/security.middleware");
const { StatusCodes } = require("http-status-codes");
const register = async (userData) => {
    const { account, password, email, location_id, fullname } = userData;
    const isExisting = await userModel.findOne({ $or: [{ account }, { email }] });
    if (isExisting) error({message : "Account and Email is exist", code : StatusCodes.BAD_REQUEST}) 
    const location = await locationModel.findById(location_id);
    if (!location) error({message: "The locations is not exist ", code: StatusCodes.BAD_REQUEST});
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
        error({message: "Incorrect account or password", code : StatusCodes.UNAUTHORIZED});
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