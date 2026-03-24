const { verifyToken } = require('./security.middleware');
const { error } = require('../utils/response');
const {StatusCodes } = require("http-status-codes")
const authenticationToken = (req, res, next) => {
    const token = req.cookies.sessionToken;
    
    if (!token) {
        return error({ message: "You are not authenticated", code: StatusCodes.UNAUTHORIZED });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return error({ message: "Session expired or invalid token", code: StatusCodes.UNAUTHORIZED });
    }

    req.user = decoded; 
    next();
};
const authenticationRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role.toUpperCase())) {
            return error({ message: "You do not have permission to access this resource", code: StatusCodes.FORBIDDEN });
        }
        next();
    };
};
const ALLOWED_ADMIN = authenticationRole(["ADMIN"]);
const ALLOWED_MANAGER = authenticationRole(["ADMIN", "MANAGER"]);
const ALLOWED_ALL = authenticationRole(["ADMIN", "MANAGER", "STAFF"]);
module.exports = { authenticationToken, authenticationRole, ALLOWED_ADMIN, ALLOWED_MANAGER, ALLOWED_ALL };
