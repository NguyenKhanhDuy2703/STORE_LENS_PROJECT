const memberService = require('../service/member.service');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const httpStatus = require('http-status-codes');

const getMemberSummary = catchAsync(async (req, res) => {
  const { location_id, search, status } = req.query;

  if (!location_id) {
    response.error({ message: 'Missing location_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const filters = {};
  if (search) filters.search = search;
  if (status) filters.status = status;

  const [metrics, list] = await Promise.all([
    memberService.getMemberMetrics(location_id),
    memberService.getMemberList(location_id, filters)
  ]);

  return response.success({
    res,
    message: 'Member summary loaded successfully',
    data: { metrics, list },
    code: httpStatus.OK
  });
});

const getMemberDetail = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;

  if (!location_id || !person_id) {
    response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.getMemberDetail(location_id, person_id);
  return response.success({ res, message: 'Member detail loaded successfully', data, code: httpStatus.OK });
});

// Create a new member in the system.
const createMember = catchAsync(async (req, res) => {
  const { location_id } = req.query;
  const memberData = req.body;

  if (!location_id) {
    response.error({ message: 'Missing location_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  // Validate required fields for creating a new member
  if (!memberData.name || !memberData.phone) {
    response.error({ message: 'Missing required fields: name and phone are required', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.createOrUpdateMember(location_id, memberData);
  return response.success({ res, message: 'Member created successfully', data, code: httpStatus.CREATED });
});

// Update member information (phone, name, birthday, etc.).
const updateMember = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;
  const updateData = req.body;

  if (!location_id || !person_id) {
    response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  // Validate that at least one field is provided for update
  if (!updateData || Object.keys(updateData).length === 0) {
    response.error({ message: 'At least one field must be provided for update', code: httpStatus.BAD_REQUEST });
  }

  const memberData = { id: person_id, ...updateData };
  const data = await memberService.createOrUpdateMember(location_id, memberData);
  return response.success({ res, message: 'Member information updated successfully', data, code: httpStatus.OK });
});

// Delete a member from the system.
const deleteMember = catchAsync(async (req, res) => {
  const { location_id, person_id } = req.query;

  if (!location_id || !person_id) {
    response.error({ message: 'Missing location_id or person_id query parameter', code: httpStatus.BAD_REQUEST });
  }

  const data = await memberService.deleteMember(location_id, person_id);
  return response.success({ res, message: 'Member deleted successfully', data, code: httpStatus.OK });
});

module.exports = {
  getMemberSummary,
  getMemberDetail,
  createMember,
  updateMember,
  deleteMember
};