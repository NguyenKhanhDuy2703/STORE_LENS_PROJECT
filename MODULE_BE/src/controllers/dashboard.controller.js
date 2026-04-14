const dashboardService = require("../service/dashboard.service");
const catchAsync = require("../utils/catchAsync");
const { success , error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const VALID_FILTER_TYPES = ['today', 'yesterday', 'last7days', 'custom'];


const getKPIMetricsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom } = req.body;
    if (!locationId) {
       error({
        res ,
        message: "Location ID is required",
        code: StatusCodes.BAD_REQUEST
       })
    }
    if (type && !['today', 'yesterday', 'last7days', 'custom'].includes(type)) {
        return error({
            res,
            message: "Invalid type parameter",
            code: StatusCodes.BAD_REQUEST
        });
    }
    const data = await dashboardService.getKPIMetrics({ locationId, type, startCustom, endCustom });
    return success({ res, data, message: "KPI metrics retrieved successfully", code: StatusCodes.OK });
});

const getHourlyCustomerFlowController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom } = req.body;
    if (!locationId) {
        return error({
            res,
            message: "Location ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }
    if (type && !['today', 'yesterday', 'last7days', 'custom'].includes(type)) {
        return error({
            res,
            message: "Invalid type parameter",
            code: StatusCodes.BAD_REQUEST
        });
    }
    const data = await dashboardService.getHourlyCustomerFlow({ locationId, type, startCustom, endCustom });
    return success({ res, data, message: "Hourly customer flow retrieved successfully", code: StatusCodes.OK });
});

const getRevenueLast7DaysController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom } = req.body;
    if (!locationId) {
        return error({
            res,
            message: "Location ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }
    if (type && !['today', 'yesterday', 'last7days', 'custom'].includes(type)) {
        return error({
            res,
            message: "Invalid type parameter",
            code: StatusCodes.BAD_REQUEST
        });
    }
    const data = await dashboardService.getRevenueLast7Days({ locationId, type, startCustom, endCustom });
    return success({ res, data, message: "7-day revenue trend retrieved successfully", code: StatusCodes.OK });
});

const getZoneAnalyticsDashboardController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const type = req.query.type ?? req.body?.type;
    const startCustom = req.query.startCustom ?? req.body?.startCustom;
    const endCustom = req.query.endCustom ?? req.body?.endCustom;

    if (!locationId) {
        return error({
            res,
            message: "Location ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }
    if (type && !VALID_FILTER_TYPES.includes(type)) {
        return error({
            res,
            message: "Invalid type parameter",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const data = await dashboardService.getZoneAnalyticsDashboard({ locationId, type, startCustom, endCustom });

    return success({
        res,
        data,
        message: "Zone analytics dashboard retrieved",
        code: StatusCodes.OK
    });
});

module.exports = {
    getKPIMetricsController,
    getHourlyCustomerFlowController,
    getRevenueLast7DaysController,
    getZoneAnalyticsDashboardController
};