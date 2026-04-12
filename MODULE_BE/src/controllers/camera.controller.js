const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const cameraService = require("../service/camera.service");

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
        upsertCameraController,
        deleteCameraController,
        getCameraController
    };