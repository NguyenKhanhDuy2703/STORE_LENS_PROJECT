const { StatusCodes } = require("http-status-codes");
const { turnOnCamera, turnOffCamera } = require("../api/cameraAI.api");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const cameraService = require("../service/camera.service");

const mock_zones = [
    {
        "zone_id": "Zone_A",
        "points": [[100, 100], [500, 100], [500, 500], [100, 500]]
    },
    {
        "zone_id": "Zone_B",
        "points": [[600, 100], [1000, 100], [1000, 500], [600, 500]]
    }
];

const turnOncameraController = catchAsync(async (req, res) => {
    const {
      cameraId ,
      urlRtsp ,
      locationId ,
    } = req.body;
    if (!cameraId || !urlRtsp || !locationId) {
        error({ message: "Missing values", code: StatusCodes.BAD_REQUEST });
    }
    const result = await turnOnCamera({cameraId, urlRtsp, locationId , listZone : mock_zones});
    
    return success({
      res,
      data: result,
      message: "Turn on camera successfully",
      code: StatusCodes.OK,
    });
});
const tunrOffcameraController = catchAsync(async (req, res) => {
        const { rtpsUrl } = req.body;
        const result = await turnOffCamera(rtpsUrl);
        return success({
            res,
            data: result,
            message: "Turn off camera successfully",
            code: StatusCodes.OK,
        });
});
const createCameraController = catchAsync(async (req, res) => {
    const data = await cameraService.createCamera(req.body);
    return success({ res, data, message: "Camera created successfully", code: StatusCodes.CREATED });
});

const updateCameraController = catchAsync(async (req, res) => {
    const { cameraCode } = req.params; 
    const data = await cameraService.updateCamera(cameraCode, req.body);
    
    if (!data) {
        return error({ res, message: "Camera not found", code: StatusCodes.NOT_FOUND });
    }

    return success({ res, data, message: "Camera updated successfully", code: StatusCodes.OK });
});

const deleteCameraController = catchAsync(async (req, res) => {
    const { cameraCode } = req.params;
    const result = await cameraService.deleteCamera(cameraCode);

    if (!result) {
        return error({ res, message: "Camera not found", code: StatusCodes.NOT_FOUND });
    }

    return success({ res, message: "Camera deleted successfully", code: StatusCodes.OK });
});

const getRequestParams = (req) => {
    const { locationId } = req.params;
    return { locationId };
};

const getCameraKPIMetricsController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await cameraService.getCameraKPIMetrics(params);
    return success({ res, data, message: "Camera KPIs retrieved successfully", code: StatusCodes.OK });
});

const getCameraListDetailsController = catchAsync(async (req, res) => {
    const params = getRequestParams(req);
    const data = await cameraService.getCameraListDetails(params);
    return success({ res, data, message: "Camera list retrieved successfully", code: StatusCodes.OK });
});

module.exports = {
    turnOncameraController,
    tunrOffcameraController,
    createCameraController,
    updateCameraController,
    deleteCameraController,
    getCameraKPIMetricsController,
    getCameraListDetailsController
};
