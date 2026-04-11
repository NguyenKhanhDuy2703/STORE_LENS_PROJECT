const areaManagementService = require("../service/areaManagement.service");
const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");


const getRequestParams = (req) => {
    const { locationId, zoneId } = req.params;
    const { type, startCustom, endCustom, date } = req.query;

    return {
        locationId,
        zoneId, 
        type, 
        startCustom,
        endCustom,
        date,
    };
};

const getAreaManagementMetricsController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await areaManagementService.getAreaManagementMetrics(params);
    return success({ res, data, message: "Area KPI metrics retrieved successfully", code: StatusCodes.OK });
});

const getAreaManagementHourlyTrafficController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await areaManagementService.getAreaHourlyTraffic(params);
    return success({ res, data, message: "Area hourly traffic retrieved successfully", code: StatusCodes.OK });
});

const getAreaManagementZonePerformanceController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await areaManagementService.getZonePerformanceDetails(params);
    return success({ res, data, message: "Zone performance history retrieved", code: StatusCodes.OK });
});

module.exports = {
    getAreaManagementMetricsController,
    getAreaManagementHourlyTrafficController,
    getAreaManagementZonePerformanceController
};