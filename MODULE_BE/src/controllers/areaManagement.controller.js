const areaManagementService = require('../service/areaManagement.service');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const { getPeriodDateRange, parseLocationIds } = require('../service/dashboard.service');

const getAreaManagementMetricsController = catchAsync(async (req, res) => {
    const { location_id, zone_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await areaManagementService.getAreaManagementMetrics(locationIds, zone_id, start, end);
    return success({ res, data, message: 'Area management metrics retrieved successfully', code: StatusCodes.OK });
});

const getAreaManagementHourlyTrafficController = catchAsync(async (req, res) => {
    const { location_id, zone_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await areaManagementService.getHourlyTraffic(locationIds, zone_id, start, end);
    return success({ res, data, message: 'Hourly traffic retrieved successfully', code: StatusCodes.OK });
});

const getAreaManagementMovementPathsController = catchAsync(async (req, res) => {
    const { location_id, from_zone_id, to_zone_id, period } = req.query;
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await areaManagementService.getMovementPaths(locationIds, from_zone_id, to_zone_id, start, end);
    return success({ res, data, message: 'Movement paths retrieved successfully', code: StatusCodes.OK });
});

const getAreaManagementZoneDetailsController = catchAsync(async (req, res) => {
    const { location_id, zone_id, period } = req.query; // thêm zone_id
    const locationIds = parseLocationIds(location_id);
    const { start, end } = getPeriodDateRange(period);

    const data = await areaManagementService.getZoneDetails(locationIds, zone_id, start, end); // truyền zone_id
    return success({ res, data, message: 'Zone details retrieved successfully', code: StatusCodes.OK });
});

module.exports = {
    getAreaManagementMetricsController,
    getAreaManagementHourlyTrafficController,
    getAreaManagementMovementPathsController,
    getAreaManagementZoneDetailsController
};