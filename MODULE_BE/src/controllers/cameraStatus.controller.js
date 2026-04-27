const { StatusCodes } = require("http-status-codes");
const { turnOnCamera, turnOffCamera } = require("../api/cameraAI.api");
const catchAsync = require("../utils/catchAsync");
const { success , error } = require("../utils/response");
const ZoneSchema = require("../schemas/zone.schema");
const CameraSchema = require("../schemas/camera.schema");

const turnOncameraController = catchAsync(async (req, res) => {
    const { cameraId, cameraCode, urlRtsp, locationId } = req.body;
    const resolvedCameraCode = cameraId || cameraCode;

    if (!resolvedCameraCode || !urlRtsp || !locationId) {
        return error({ res, message: "Missing required fields: cameraCode, urlRtsp, locationId", code: StatusCodes.BAD_REQUEST });
    }

    // Lấy danh sách zone — nếu không có zone hoặc lỗi DB thì vẫn tiếp tục với list_zone rỗng
    let listZone = [];
    try {
        listZone = await ZoneSchema.getListZoneByCameraCode({
            locationId,
            cameraCode: resolvedCameraCode,
        });
    } catch {
        listZone = [];
    }

    const result = await turnOnCamera({
        cameraId: resolvedCameraCode,
        urlRtsp,
        locationId,
        listZone,
    });

    // Cập nhật status trong DB sau khi AI bật thành công
    await CameraSchema.findOneAndUpdate(
        { camera_code: resolvedCameraCode },
        { $set: { status: 'active', last_heartbeat: new Date() } }
    );

    return success({
        res,
        data: result,
        message: "Turn on camera successfully",
        code: StatusCodes.OK,
    });
});

const tunrOffcameraController = catchAsync(async (req, res) => {
    const urlRtsp = req.query.urlRtsp || req.query.rtspUrl || req.body?.urlRtsp || req.body?.rtspUrl;

    if (!urlRtsp) {
        return error({ res, message: "Missing urlRtsp", code: StatusCodes.BAD_REQUEST });
    }

    const result = await turnOffCamera(urlRtsp);

    // Cập nhật status trong DB sau khi AI tắt thành công
    await CameraSchema.findOneAndUpdate(
        { rtsp_url: urlRtsp },
        { $set: { status: 'inactive', camera_state: { last_stop_time: new Date() } } }
    );

    return success({
        res,
        data: result,
        message: "Turn off camera successfully",
        code: StatusCodes.OK,
    });
});
module.exports = {
  turnOncameraController,
  tunrOffcameraController
};
