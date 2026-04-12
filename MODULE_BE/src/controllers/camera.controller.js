const { StatusCodes } = require("http-status-codes");
const { turnOnCamera, turnOffCamera } = require("../api/cameraAI.api");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const cameraService = require("../service/camera.service");

const mock_zones = [
    {
        "zone_id": "Zone_A",
        "points": [[100, 100], [500, 100], [500, 500], [100, 500]]
    }
];

const turnOncameraController = catchAsync(async (req, res) => {
    const { cameraId, urlRtsp, locationId } = req.body;
    
    if (!cameraId || !urlRtsp || !locationId) {
        return error({ res, message: "Missing values", code: StatusCodes.BAD_REQUEST });
    }

    const result = await turnOnCamera({ cameraId, urlRtsp, locationId, listZone: mock_zones });
    
    await cameraService.upsertCamera(cameraId, { status: 'active' });

    return success({
      res,
      data: result,
      message: "Turn on camera successfully",
      code: StatusCodes.OK,
    });
});

const turnOffcameraController = catchAsync(async (req, res) => {
    const { rtspUrl, cameraId } = req.body; 
    
    if (!rtspUrl || !cameraId) {
        return error({ res, message: "Missing rtspUrl or cameraId", code: StatusCodes.BAD_REQUEST });
    }

    const result = await turnOffCamera(rtspUrl);
    
    await cameraService.upsertCamera(cameraId, { status: 'inactive' });

    return success({
        res,
        data: result,
        message: "Turn off camera successfully",
        code: StatusCodes.OK,
    });
});

const upsertCameraController = catchAsync(async (req, res) => {
    const cameraCode = req.body.camera_code || req.params.cameraCode;
    
    if (!cameraCode) {
        return error({ res, message: "Camera Code is required", code: StatusCodes.BAD_REQUEST });
    }

    const data = await cameraService.upsertCamera(cameraCode, req.body);
    
    return success({ 
        res, 
        data, 
        message: "Camera processed successfully", 
        code: StatusCodes.OK 
    });
});

const deleteCameraController = catchAsync(async (req, res) => {
    const { cameraCode } = req.params;
    const result = await cameraService.deleteCamera(cameraCode);

    if (!result) {
        return error({ res, message: "Camera not found", code: StatusCodes.NOT_FOUND });
    }

    return success({ res, message: "Camera deleted successfully", code: StatusCodes.OK });
});

const getCameraController = catchAsync(async (req, res) => {
    const data = await cameraService.getCameraDashboardData();
    return success({ res, data, message: "Dashboard data retrieved successfully", code: StatusCodes.OK });
});

module.exports = {
    turnOncameraController,
    turnOffcameraController,
    upsertCameraController,
    deleteCameraController,
    getCameraController
};