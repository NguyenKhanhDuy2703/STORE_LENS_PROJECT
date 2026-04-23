const memberService = require('../service/member.service');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const httpStatus = require('http-status-codes');

const getDashboard = catchAsync(async (req, res) => {
  const { location_id } = req.query;

  if (!location_id) {
    return response.error({ message: 'Missing location_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.getMemberDashboard(location_id);
  return response.success({ res, message: 'Member dashboard loaded successfully', data, code: httpStatus.OK });
});

const getMemberDetail = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;

  if (!location_id || !person_id) {
    return response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.getMemberDetail(location_id, person_id);
  return response.success({ res, message: 'Member detail loaded successfully', data, code: httpStatus.OK });
});

module.exports = {
  getDashboard,
  getMemberDetail
};