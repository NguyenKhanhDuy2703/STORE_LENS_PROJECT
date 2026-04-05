const memberService = require('../service/member.service');
const catchAsync = require('../utils/catchAsync');
const response = require('../utils/response');
const httpStatus = require('http-status-codes');

const getInsights = catchAsync(async (req, res) => {
  const { location_id } = req.query;

  if (!location_id) {
    return response.error(res, 'Vui lòng cung cấp location_id', httpStatus.BAD_REQUEST);
  }

  const data = await memberService.getMemberSegmentation(location_id);
  
  return response.success(res, 'Lấy dữ liệu phân khúc khách hàng thành công', data);
});

module.exports = {
  getInsights
};