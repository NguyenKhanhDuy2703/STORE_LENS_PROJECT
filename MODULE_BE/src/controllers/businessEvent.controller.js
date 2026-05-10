const catchAsync = require('../utils/catchAsync');
const { success, error } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const businessEventService = require('../service/businessEvent.service');
const posWorker = require('../workers/pos.worker');

const upsertBusinessEvent = catchAsync(async (req, res) => {
    const { location_id, event_code, date, total_amount, discount, event_details } = req.body || {};

    if (!location_id) {
        return error({ message: 'location_id is required', code: StatusCodes.BAD_REQUEST });
    }

    if (!event_code) {
        return error({ message: 'event_code is required', code: StatusCodes.BAD_REQUEST });
    }

    if (!date) {
        return error({ message: 'date is required', code: StatusCodes.BAD_REQUEST });
    }

    if (isNaN(new Date(date))) {
        return error({ message: 'date is invalid', code: StatusCodes.BAD_REQUEST });
    }

    if (total_amount !== undefined && total_amount < 0) {
        return error({ message: 'total_amount must be >= 0', code: StatusCodes.BAD_REQUEST });
    }

    if (discount !== undefined && discount < 0) {
        return error({ message: 'discount must be >= 0', code: StatusCodes.BAD_REQUEST });
    }

    if (event_details !== undefined) {
        for (const item of event_details) {
            if (item.quantity < 0) {
                return error({ message: 'event_details[].quantity must be >= 0', code: StatusCodes.BAD_REQUEST });
            }
            if (item.unit_price < 0) {
                return error({ message: 'event_details[].unit_price must be >= 0', code: StatusCodes.BAD_REQUEST });
            }
        }
    }

    const result = await businessEventService.upsertBusinessEvent(req.body);

    return success({ res, message: 'Business event saved successfully', code: StatusCodes.OK, data: result });
});

const getBusinessEvents = catchAsync(async (req, res) => {
    const { locationId } = req.query;

    if (!locationId) {
        return error({ message: 'locationId is required', code: StatusCodes.BAD_REQUEST });
    }

    const result = await businessEventService.getBusinessEvents(req.query);

    return success({ res, message: 'Business events retrieved successfully', code: StatusCodes.OK, data: result });
});

const getBusinessEventDetail = catchAsync(async (req, res) => {
    const result = await businessEventService.getBusinessEventDetail(req.params.eventCode);

    return success({ res, message: 'Business event retrieved successfully', code: StatusCodes.OK, data: result });
});

const uploadExcelEvents = catchAsync(async (req, res) => {
    const { location_id } = req.body || {};
    
    if (!location_id) {
        return error({ message: 'location_id is required', code: StatusCodes.BAD_REQUEST });
    }

    if (!req.file) {
        return error({ message: 'Excel file is required', code: StatusCodes.BAD_REQUEST });
    }

    // Không dùng await ở đây để không block request, trả về ngay 202 Accepted
    posWorker.processExcel(req.file.buffer, location_id).catch(err => {
        console.error('Lỗi khi chạy posWorker:', err);
    });

    return success({ 
        res, 
        message: 'File đã được tiếp nhận và đang được xử lý ngầm (Background Task)', 
        code: StatusCodes.ACCEPTED 
    });
});

module.exports = { upsertBusinessEvent, getBusinessEvents, getBusinessEventDetail, uploadExcelEvents };
