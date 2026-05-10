const { StatusCodes } = require("http-status-codes");
const { turnOnCamera, turnOffCamera } = require("../api/cameraAI.api");
const catchAsync = require("../utils/catchAsync");
const { success , error } = require("../utils/response");
const { getCurrnetDateVN } = require("../utils/date.util");
const ZoneSchema = require("../schemas/zone.schema");
const CameraSchema = require("../schemas/camera.schema");

const turnOncameraController = catchAsync(async (req, res) => {
    const { cameraId, cameraCode, urlRtsp, locationId } = req.body;
    const resolvedCameraCode = cameraId || cameraCode;

    if (!resolvedCameraCode || !urlRtsp || !locationId) {
        return error({ res, message: "Missing required fields: cameraCode, urlRtsp, locationId", code: StatusCodes.BAD_REQUEST });
    }

    // Disable ETag to prevent 304 Not Modified responses
    res.set('ETag', '');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

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

    try {
        const result = await turnOnCamera({
            cameraId: resolvedCameraCode,
            urlRtsp,
            locationId,
            listZone,
        });

        // Cập nhật status trong DB sau khi AI bật thành công
        const updateResult = await CameraSchema.findOneAndUpdate(
            { camera_code: resolvedCameraCode },
            { $set: { status: 'active', last_heartbeat: getCurrnetDateVN() } },
            { new: true }
        );

        if (!updateResult) {
            console.warn(`[Camera Turn-On] No camera found with camera_code: ${resolvedCameraCode}`);
        }

        return success({
            res,
            data: {
                ...result,
                updated: !!updateResult,
                timestamp: getCurrnetDateVN()
            },
            message: "Turn on camera successfully",
            code: StatusCodes.OK,
        });
    } catch (err) {
        // Nếu MODULE_AI call fail → set status thành 'error' thay vì 'active'
        await CameraSchema.findOneAndUpdate(
            { camera_code: resolvedCameraCode },
            {
                $set: {
                    status: 'error',
                    camera_state: {
                        error_message: err.message || 'Failed to start process',
                        error_time: getCurrnetDateVN(),
                    },
                },
            }
        );

        return error({
            res,
            message: `Failed to turn on camera: ${err.message || 'Unknown error'}`,
            code: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});

const tunrOffcameraController = catchAsync(async (req, res) => {
    // Nhận cameraCode để query DB chính xác (unique index), urlRtsp để gọi AI
    const urlRtsp = req.query.urlRtsp || req.query.rtspUrl || req.body?.urlRtsp || req.body?.rtspUrl;
    const cameraCode = req.query.cameraCode || req.query.cameraId || req.body?.cameraCode || req.body?.cameraId;

    if (!urlRtsp) {
        return error({ res, message: "Missing urlRtsp", code: StatusCodes.BAD_REQUEST });
    }

    // Disable ETag to prevent 304 Not Modified responses
    res.set('ETag', '');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const result = await turnOffCamera(urlRtsp);

    // Ưu tiên query theo camera_code (unique index) để tránh mismatch format rtsp_url
    const dbQuery = cameraCode
        ? { camera_code: cameraCode }
        : { rtsp_url: urlRtsp };

    const updateResult = await CameraSchema.findOneAndUpdate(
        dbQuery,
        { $set: { status: 'inactive', camera_state: { last_stop_time: new Date() } } },
        { new: true }
    );

    if (!updateResult) {
        console.warn(`[Camera Turn-Off] No camera found with query: ${JSON.stringify(dbQuery)}`);
    }

    return success({
        res,
        data: {
            ...result,
            updated: !!updateResult,
            timestamp: getCurrnetDateVN()
        },
        message: "Turn off camera successfully",
        code: StatusCodes.OK,
    });
});
module.exports = {
  turnOncameraController,
  tunrOffcameraController
};
