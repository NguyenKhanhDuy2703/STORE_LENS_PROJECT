const  handleException  = require('../utils/exceptions');
const { error } = require('../utils/response');

const authenticationToken = (req, res, next) => {
    const token = req.cookies.sessionToken;
    
    if (!token) {
        return error("Bạn chưa đăng nhập", 401);
    }
    //  Giải mã token
    const decoded = handleException(token);
    if (!decoded) {
        return error(" đăng nhập hết hạn hoặc không hợp lệ", 401);
    }
    req.user = decoded; 
    next();
};
const authenticationRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role.toUpperCase())) {
            return error("Bạn không có quyền truy cập chức năng này", 403);
        }
        next();
    };
};

module.exports = { authenticationToken, authenticationRole };
