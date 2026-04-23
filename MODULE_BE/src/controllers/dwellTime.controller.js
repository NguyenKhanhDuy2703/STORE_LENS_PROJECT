const dwellTimeService = require("../service/dwellTime.service");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

const getMetricsController = catchAsync(async (req, res) => {
	const { locationId } = req.params;
	const { date } = req.query;

	if (!locationId) {
		return error({
			message: "Location ID is required",
			code: StatusCodes.BAD_REQUEST,
		});
	}

	const data = await dwellTimeService.getMetrics({ locationId, date });

	return success({
		res,
		data,
		message: "Dwell time metrics retrieved successfully",
		code: StatusCodes.OK,
	});
});

const getPerformanceInteractController = catchAsync(async (req, res) => {
	const { locationId } = req.params;
	const { date } = req.query;

	if (!locationId) {
		return error({
			message: "Location ID is required",
			code: StatusCodes.BAD_REQUEST,
		});
	}

	const data = await dwellTimeService.getPerformanceInteract({ locationId, date });

	return success({
		res,
		data,
		message: "Dwell time performance interact retrieved successfully",
		code: StatusCodes.OK,
	});
});

const getAnalysisDwellTimeController = catchAsync(async (req, res) => {
	const { locationId, date } = req.query;

	if (!locationId) {
		return error({
			message: "location_id is required",
			code: StatusCodes.BAD_REQUEST,
		});
	}

	const data = await dwellTimeService.getAnalysisDwellTime({ location_id:locationId, date });

	return success({
		res,
		data,
		message: "Dwell time analysis retrieved successfully",
		code: StatusCodes.OK,
	});
});

module.exports = {
	getMetricsController,
	getPerformanceInteractController,
	getAnalysisDwellTimeController,
};
