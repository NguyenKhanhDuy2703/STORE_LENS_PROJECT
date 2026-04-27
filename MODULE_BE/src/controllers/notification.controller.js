const notificationService = require("../service/notification.service");
const ruleCustomerWorker = require("../workers/ruleCustomer.worker");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const getNotificationsController = catchAsync(async (req, res) => {
    const location_id = req.query.locationId || req.query.location_id;

    if (!location_id) {
        return error({
            res,
            message: "location_id is required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    // Chạy worker trước để cập nhật notification mới nhất dựa trên rule
    // Không await để không block response — chạy ngầm
    ruleCustomerWorker.process({ location_id }).catch((err) => {
        // Chỉ log lỗi, không làm hỏng response
        console.error(`[notification] ruleCustomerWorker failed: ${err.message}`);
    });

    const data = await notificationService.getAllNotifications({ location_id });

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