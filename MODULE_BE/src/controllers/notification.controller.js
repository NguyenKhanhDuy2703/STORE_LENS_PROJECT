const notificationService = require("../service/notification.service");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const getNotificationsController = catchAsync(async (req, res) => {
    const data = await notificationService.getAllNotifications();

    if (!data) {
        return error({
            res,
            message: "Internal Server Error",
            code: StatusCodes.INTERNAL_SERVER_ERROR
        });
    }

    return success({ 
        res, 
        data: data || [], 
        message: "All notifications retrieved successfully", 
        code: StatusCodes.OK 
    });
});

const markReadController = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return error({
            res,
            message: "Notification ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const data = await notificationService.updateReadStatus(id, true);

    if (!data) {
        return error({
            res,
            message: "Notification not found",
            code: StatusCodes.NOT_FOUND
        });
    }

    return success({
        res,
        data,
        message: "Notification marked as read",
        code: StatusCodes.OK
    });
});

module.exports = {
    getNotificationsController,
    markReadController
};