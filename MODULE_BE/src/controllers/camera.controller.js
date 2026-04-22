const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const cameraService = require("../service/camera.service");

    const upsertCameraController = catchAsync(async (req, res) => {
        const cameraCodeFromBody = req.body.camera_code || req.body.cameraCode;
        const cameraCodeFromParams = req.params.cameraCode;
        const cameraCode = cameraCodeFromParams || cameraCodeFromBody;

        const cameraPayload = {
            location_id: req.body.location_id || req.body.locationId,
            camera_name: req.body.camera_name || req.body.cameraName,
            camera_code: cameraCode,
            rtsp_url: req.body.rtsp_url || req.body.rtspUrl,
            url_image_snapshot: req.body.url_image_snapshot || req.body.urlImageSnapshot,
            status: req.body.status,
            last_heartbeat: req.body.last_heartbeat || req.body.lastHeartbeat,
            installation_date: req.body.installation_date || req.body.installationDate,
            camera_spec: req.body.camera_spec || req.body.cameraSpec,
            camera_state: req.body.camera_state || req.body.cameraState,
        };

        if (!cameraCode) {
            return error({ res, message: "Camera Code is required", code: StatusCodes.BAD_REQUEST });
        }

        if (cameraCodeFromBody && cameraCodeFromParams && cameraCodeFromBody !== cameraCodeFromParams) {
            return error({
                res,
                message: "Camera Code in body does not match cameraCode in params",
                code: StatusCodes.BAD_REQUEST
            });
        }

        if (!cameraPayload.location_id) {
            return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
        }

        if (!cameraPayload.camera_name) {
            return error({ res, message: "Camera Name is required", code: StatusCodes.BAD_REQUEST });
        }

        if (!cameraPayload.rtsp_url) {
            return error({ res, message: "RTSP URL is required", code: StatusCodes.BAD_REQUEST });
        }

        const data = await cameraService.upsertCamera(cameraCode, cameraPayload);

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
        const {locationId} = req.query;
        if (!locationId) {
            return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
        }
        const data = await cameraService.getCameraDashboardData({locationId});
        return success({ res, data, message: "Dashboard data retrieved successfully", code: StatusCodes.OK });
    });

    const getCameraAndZoneInfoController = catchAsync(async (req, res) => {
        const { locationId } = req.query;

        if (!locationId) {
            return error({ res, message: "Location ID is required", code: StatusCodes.BAD_REQUEST });
        }

        const data = await cameraService.getCameraAndZoneInfo({ locationId });

        return success({
            res,
            data,
            message: "Camera and zone info retrieved successfully",
            code: StatusCodes.OK
        });
    });

    const getCameraWithZonesByAllcationIdController = catchAsync(async (req, res) => {
        const { allcationId, allocationId, locationId } = req.query;
        const finalLocationId = allcationId || allocationId || locationId;

        if (!finalLocationId) {
            return error({ res, message: "allcationId (or allocationId/locationId) is required", code: StatusCodes.BAD_REQUEST });
        }

        const data = await cameraService.getCameraWithZonesByAllcationId({
            allcationId,
            allocationId,
            locationId
        });

        return success({
            res,
            data,
            message: "Camera list with full zones retrieved successfully",
            code: StatusCodes.OK
        });
    });

    module.exports = {
        upsertCameraController,
        deleteCameraController,
        getCameraController,
        getCameraAndZoneInfoController,
        getCameraWithZonesByAllcationIdController
    };