const locationService = require("../service/allocation.service");
const { StatusCodes } = require("http-status-codes");
const { success , error } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const getLocationLocationController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    if (!locationId) {
        return error({
            res,
            message: "Location ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }
    const data = await locationService.getLocation(locationId);
    return success({ res, data, message: "Location retrieved successfully", code: StatusCodes.OK });
}
);
module.exports = {
    getLocationLocationController
}