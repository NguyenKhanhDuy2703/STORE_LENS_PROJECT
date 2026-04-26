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

// Create a new member in the system.
const createMember = catchAsync(async (req, res) => {
  const { location_id } = req.query;
  const memberData = req.body;

  if (!location_id) {
    return response.error({ message: 'Missing location_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.createMember(location_id, memberData);
  return response.success({ res, message: 'Member created successfully', data, code: httpStatus.CREATED });
});

// Update member note field only.
const updateMemberNote = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;
  const { note } = req.body;

  if (!location_id || !person_id) {
    return response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.updateMemberNote(location_id, person_id, note);
  return response.success({ res, message: 'Member note updated successfully', data, code: httpStatus.OK });
});

// Update member information (phone, name, birthday, etc.).
const updateMember = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;
  const updateData = req.body;

  if (!location_id || !person_id) {
    return response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.updateMember(location_id, person_id, updateData);
  return response.success({ res, message: 'Member information updated successfully', data, code: httpStatus.OK });
});

// Delete a member from the system.
const deleteMember = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;

  if (!location_id || !person_id) {
    return response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.deleteMember(location_id, person_id);
  return response.success({ res, message: 'Member deleted successfully', data, code: httpStatus.OK });
});

module.exports = {
  getDashboard,
  getMemberDetail,
  createMember,
  updateMemberNote,
  updateMember,
  deleteMember
};