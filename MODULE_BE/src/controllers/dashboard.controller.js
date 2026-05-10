const dashboardService = require("../service/dashboard.service");
const catchAsync = require("../utils/catchAsync");
const { success , error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const VALID_FILTER_TYPES = ['today', 'yesterday', 'last7days', 'last30days', 'custom'];

// ── Existing controllers (type-based) ────────────────────────────────────────

const getKPIMetricsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom } = { ...req.query, ...req.body };
    if (!locationId) {
       error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (type && !VALID_FILTER_TYPES.includes(type)) {
        return error({ res, message: "Invalid type parameter", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getKPIMetrics({ locationId, type, startCustom, endCustom });
    return success({ res, data, message: "KPI metrics retrieved successfully", code: StatusCodes.OK });
});

const getHourlyCustomerFlowController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom } = { ...req.query, ...req.body };
    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (type && !VALID_FILTER_TYPES.includes(type)) {
        return error({ res, message: "Invalid type parameter", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getHourlyCustomerFlow({ locationId, type, startCustom, endCustom });
    return success({ res, data, message: "Hourly customer flow retrieved successfully", code: StatusCodes.OK });
});

const getRevenueLast7DaysController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom } = { ...req.query, ...req.body };
    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (type && !VALID_FILTER_TYPES.includes(type)) {
        return error({ res, message: "Invalid type parameter", code: StatusCodes.BAD_REQUEST });
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
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (type && !VALID_FILTER_TYPES.includes(type)) {
        return error({ res, message: "Invalid type parameter", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getZoneAnalyticsDashboard({ locationId, type, startCustom, endCustom });
    return success({ res, data, message: "Zone analytics dashboard retrieved", code: StatusCodes.OK });
});

// ── Monthly controllers ───────────────────────────────────────────────────────

const getMonthlyKPIMetricsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const year  = parseInt(req.query.year  ?? req.body?.year);
    const month = parseInt(req.query.month ?? req.body?.month);
    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (!year || !month || month < 1 || month > 12) {
        return error({ res, message: "Valid year and month (1-12) are required", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getMonthlyKPIMetrics({ locationId, year, month });
    return success({ res, data, message: "Monthly KPI metrics retrieved", code: StatusCodes.OK });
});

const getDailyStatsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const year  = parseInt(req.query.year  ?? req.body?.year);
    const month = parseInt(req.query.month ?? req.body?.month);
    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (!year || !month || month < 1 || month > 12) {
        return error({ res, message: "Valid year and month (1-12) are required", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getDailyStats({ locationId, year, month });
    return success({ res, data, message: "Daily stats retrieved", code: StatusCodes.OK });
});

const getMonthlyZoneAnalyticsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const year  = parseInt(req.query.year  ?? req.body?.year);
    const month = parseInt(req.query.month ?? req.body?.month);
    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (!year || !month || month < 1 || month > 12) {
        return error({ res, message: "Valid year and month (1-12) are required", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getMonthlyZoneAnalytics({ locationId, year, month });
    return success({ res, data, message: "Monthly zone analytics retrieved", code: StatusCodes.OK });
});

// ── Yearly controllers ────────────────────────────────────────────────────────

const getYearlyStatsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const year = parseInt(req.query.year ?? req.body?.year);
    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }
    if (!year || isNaN(year)) {
        return error({ res, message: "Valid year is required", code: StatusCodes.BAD_REQUEST });
    }
    const data = await dashboardService.getYearlyStats({ locationId, year });
    return success({ res, data, message: "Yearly stats retrieved", code: StatusCodes.OK });
});

module.exports = {
    getKPIMetricsController,
    getHourlyCustomerFlowController,
    getRevenueLast7DaysController,
    getZoneAnalyticsDashboardController,
    // Monthly
    getMonthlyKPIMetricsController,
    getDailyStatsController,
    getMonthlyZoneAnalyticsController,
    // Yearly
    getYearlyStatsController
};