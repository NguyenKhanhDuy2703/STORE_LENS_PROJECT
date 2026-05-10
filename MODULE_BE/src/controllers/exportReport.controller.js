const exportReportService = require("../service/exportReport.service");
const catchAsync = require("../utils/catchAsync");
const { error } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");
const moment = require('moment-timezone');

const exportAttendanceReportController = catchAsync(async (req, res) => {
    const { locationId } = req.params;
    const { type, startCustom, endCustom, months, year } = req.body;

    if (!locationId) {
        return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
    }

    // GỌI SERVICE TỔNG HỢP với params
    const workbook = await exportReportService.exportComprehensiveReportService(locationId, { type, startCustom, endCustom, months, year });

    const vietDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
    const fileName = `Bao_Cao_Tong_Hop_${vietDate}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
});

module.exports = { exportAttendanceReportController };