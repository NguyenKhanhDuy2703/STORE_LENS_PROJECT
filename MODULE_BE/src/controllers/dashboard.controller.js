const dashboardService = require("../service/dashboard.service");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const logger = require("../utils/logging");
const { StatusCodes } = require("http-status-codes");
const { getPeriodDateRange, parseLocationIds } = require("../service/dashboard.service");

const getKPIMetricsController = catchAsync(async (req, res) => {
    const { location_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await dashboardService.getKPIMetrics(locationIds, start, end);
    return success({ res, data, message: "KPI metrics retrieved successfully", code: StatusCodes.OK });
});

const getHourlyCustomerFlowController = catchAsync(async (req, res) => {
    const { location_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await dashboardService.getHourlyCustomerFlow(locationIds, start, end);
    return success({ res, data, message: "Hourly customer flow retrieved successfully", code: StatusCodes.OK });
});

const getRevenueLast7DaysController = catchAsync(async (req, res) => {
    const { location_id } = req.query;
    const locationIds = parseLocationIds(location_id);

    const data = await dashboardService.getRevenueLast7Days(locationIds);
    return success({ res, data, message: "Revenue for last 7 days retrieved successfully", code: StatusCodes.OK });
});

const getHighTrafficZonesController = catchAsync(async (req, res) => {
    const { location_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await dashboardService.getHighTrafficZones(locationIds, start, end);
    return success({ res, data, message: "High traffic zones retrieved successfully", code: StatusCodes.OK });
});

const getZonePerformanceDetailsController = catchAsync(async (req, res) => {
    const { location_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await dashboardService.getZonePerformanceDetails(locationIds, start, end);
    return success({ res, data, message: "Zone performance details retrieved successfully", code: StatusCodes.OK });
});

module.exports = { getKPIMetricsController, getHourlyCustomerFlowController, getRevenueLast7DaysController, getHighTrafficZonesController, getZonePerformanceDetailsController }
