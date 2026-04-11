const dashboardService = require("../service/dashboard.service");
const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const getRequestParams = (req) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom, date } = req.query;

    return {
        locationId,
        type: type , 
        startCustom,
        endCustom,
        date,
    };
};

const getKPIMetricsController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await dashboardService.getKPIMetrics(params);
    return success({ res, data, message: "KPI metrics retrieved successfully", code: StatusCodes.OK });
});

const getHourlyCustomerFlowController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await dashboardService.getHourlyCustomerFlow(params);
    return success({ res, data, message: "Hourly customer flow retrieved successfully", code: StatusCodes.OK });
});

const getRevenueLast7DaysController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await dashboardService.getRevenueLast7Days(params);
    return success({ res, data, message: "7-day revenue trend retrieved successfully", code: StatusCodes.OK });
});

const getHighTrafficZonesController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await dashboardService.getHighTrafficZones(params);
    return success({ res, data, message: "High traffic zones ranking retrieved", code: StatusCodes.OK });
});

const getZonePerformanceDetailsController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await dashboardService.getZonePerformanceDetails(params);
    return success({ res, data, message: "Zone performance details retrieved", code: StatusCodes.OK });
});

module.exports = {
    getKPIMetricsController,
    getHourlyCustomerFlowController,
    getRevenueLast7DaysController,
    getHighTrafficZonesController,
    getZonePerformanceDetailsController
};