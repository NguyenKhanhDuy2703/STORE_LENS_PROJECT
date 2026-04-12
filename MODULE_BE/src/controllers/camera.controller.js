const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const cameraService = require("../service/camera.service");


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
    createCameraController,
    updateCameraController,
    deleteCameraController,
    getCameraKPIMetricsController,
    getCameraListDetailsController
};
