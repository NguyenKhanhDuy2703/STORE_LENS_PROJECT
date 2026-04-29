// flowPatterns.controller.js
// Controller xử lý HTTP requests cho flow patterns analysis.

const flowPatternsService = require("../service/flowPatterns.service");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");

// POST /api/v1/flow-patterns/analyze/:locationId
// Body: { minSupport, minConfidence, minLift } — tất cả optional
// Chạy cả fpgrowth và prefixspan song song
const analyzeFlowPatternsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { minSupport, minConfidence, minLift } = req.body || {};

    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }

    const data = await flowPatternsService.saveFlowPatterns({
        locationId, minSupport, minConfidence, minLift
    });

    return success({
        res, data,
        message: "Flow patterns analyzed successfully",
        code: StatusCodes.OK
    });
});

// GET /api/v1/flow-patterns/:locationId
// Lấy tất cả patterns của location (không filter algorithm)
const getFlowPatternsController = catchAsync(async (req, res) => {
    const { locationId } = req.params;

    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }

    const data = await flowPatternsService.getFlowPatterns({ locationId });

    return success({
        res, data,
        message: "Flow patterns retrieved successfully",
        code: StatusCodes.OK
    });
});

module.exports = { analyzeFlowPatternsController, getFlowPatternsController };
