const memberService = require('../service/member.service');
const catchAsync = require('../utils/catchAsync');
const { success, error } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');

// GET /member/summary?locationId=...&search=...&status=...
const getMemberSummary = catchAsync(async (req, res) => {
    const { locationId, search, status } = req.query;

    if (!locationId) {
        return error({ res, message: 'locationId is required', code: StatusCodes.BAD_REQUEST });
    }

    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;

    const [metrics, list] = await Promise.all([
        memberService.getMemberMetrics(locationId),
        memberService.getMemberList(locationId, filters)
    ]);

    return success({ res, data: { metrics, list }, message: 'Member summary loaded successfully', code: StatusCodes.OK });
});

// GET /member/:memberCode?locationId=...
const getMemberDetail = catchAsync(async (req, res) => {
    const { memberCode } = req.params;
    const { locationId } = req.query;

    if (!locationId || !memberCode) {
        return error({ res, message: 'locationId and memberCode are required', code: StatusCodes.BAD_REQUEST });
    }

    const data = await memberService.getMemberDetail(locationId, memberCode);
    return success({ res, data, message: 'Member detail loaded successfully', code: StatusCodes.OK });
});

// POST /member?locationId=...
// Tạo mới nếu code chưa tồn tại, cập nhật nếu đã có (upsert theo code)
const saveMember = catchAsync(async (req, res) => {
    const { locationId } = req.query;
    const memberData = req.body;

    if (!locationId) {
        return error({ res, message: 'locationId is required', code: StatusCodes.BAD_REQUEST });
    }

    if (!memberData.code || !memberData.name || !memberData.phone || !memberData.birthday) {
        return error({ res, message: 'code, name, phone and birthday are required', code: StatusCodes.BAD_REQUEST });
    }

    const data = await memberService.saveOrUpdateMember(locationId, memberData);
    return success({ res, data, message: 'Member saved successfully', code: StatusCodes.OK });
});

// DELETE /member/:memberCode?locationId=...
const deleteMember = catchAsync(async (req, res) => {
    const { memberCode } = req.params;
    const { locationId } = req.query;

    if (!locationId || !memberCode) {
        return error({ res, message: 'locationId and memberCode are required', code: StatusCodes.BAD_REQUEST });
    }

    const data = await memberService.deleteMember(locationId, memberCode);
    return success({ res, data, message: 'Member deleted successfully', code: StatusCodes.OK });
});

module.exports = { getMemberSummary, getMemberDetail, saveMember, deleteMember };
