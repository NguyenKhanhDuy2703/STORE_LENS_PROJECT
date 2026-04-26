const areaManagementService = require("../service/areaManagement.service");
const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const getAreaManagementMetricsController = catchAsync(async (req, res) => {
    const { locationId, zoneId, type } = req.query;
    const data = await areaManagementService.getAreaManagementMetrics({
        locationId,
        zoneId,
        type,
    });
    return success({ res, data, message: "Area KPI metrics retrieved successfully", code: StatusCodes.OK });
});

const getAreaManagementHourlyTrafficController = catchAsync(async (req, res) => {
    const { locationId, zoneId, type } = req.query;
    const data = await areaManagementService.getAreaHourlyTraffic({
        locationId,
        zoneId,
        type,
    });
    return success({ res, data, message: "Area hourly traffic retrieved successfully", code: StatusCodes.OK });
});

const getAreaManagementZonePerformanceController = catchAsync(async (req, res) => {
    const { locationId, type, cameraId } = req.query;
    const data = await areaManagementService.getZonePerformanceDetails({
        locationId,
        type,
        cameraId,
    });
    return success({ res, data, message: "Zone performance history retrieved", code: StatusCodes.OK });
});

module.exports = {
    getAreaManagementMetricsController,
    getAreaManagementHourlyTrafficController,
    getAreaManagementZonePerformanceController
};