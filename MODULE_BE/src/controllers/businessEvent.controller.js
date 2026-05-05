// businessEvent.controller.js
// Controller xử lý HTTP requests cho business events.

const catchAsync = require('../utils/catchAsync');
const { success, error } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const businessEventService = require('../service/businessEvent.service');

// POST /api/v1/business-event
// Body: { location_id, event_code, date, total_amount?, discount?, event_details? }
const upsertBusinessEvent = catchAsync(async (req, res) => {
    const { location_id, event_code, date, total_amount, discount, event_details } = req.body || {};

    if (!location_id) {
        return error({ res, message: 'location_id is required', code: StatusCodes.BAD_REQUEST });
    }

    if (!event_code) {
        return error({ res, message: 'event_code is required', code: StatusCodes.BAD_REQUEST });
    }

    if (!date) {
        return error({ res, message: 'date is required', code: StatusCodes.BAD_REQUEST });
    }

    if (isNaN(new Date(date))) {
        return error({ res, message: 'date is invalid', code: StatusCodes.BAD_REQUEST });
    }

    if (total_amount !== undefined && total_amount < 0) {
        return error({ res, message: 'total_amount must be >= 0', code: StatusCodes.BAD_REQUEST });
    }

    if (discount !== undefined && discount < 0) {
        return error({ res, message: 'discount must be >= 0', code: StatusCodes.BAD_REQUEST });
    }

    if (event_details !== undefined) {
        for (const item of event_details) {
            if (item.quantity < 0) {
                return error({ res, message: 'event_details[].quantity must be >= 0', code: StatusCodes.BAD_REQUEST });
            }
            if (item.unit_price < 0) {
                return error({ res, message: 'event_details[].unit_price must be >= 0', code: StatusCodes.BAD_REQUEST });
            }
        }
    }

    const result = await businessEventService.upsertBusinessEvent(req.body);

    return success({ res, message: 'Business event saved successfully', code: StatusCodes.OK, data: result });
});

// GET /api/v1/business-event
// Query: { locationId, startDate?, endDate?, status? }
const getBusinessEvents = catchAsync(async (req, res) => {
    const { locationId } = req.query;

    if (!locationId) {
        return error({ res, message: 'locationId is required', code: StatusCodes.BAD_REQUEST });
    }

    const result = await businessEventService.getBusinessEvents(req.query);

    return success({ res, message: 'Business events retrieved successfully', code: StatusCodes.OK, data: result });
});

// GET /api/v1/business-event/:eventCode
const getBusinessEventDetail = catchAsync(async (req, res) => {
    const result = await businessEventService.getBusinessEventDetail(req.params.eventCode);

    return success({ res, message: 'Business event retrieved successfully', code: StatusCodes.OK, data: result });
});

module.exports = { upsertBusinessEvent, getBusinessEvents, getBusinessEventDetail };
