const { StatusCodes } = require("http-status-codes");
const { turnOnCamera, turnOffCamera } = require("../api/cameraAI.api");
const catchAsync = require("../utils/catchAsync");
const { success , error } = require("../utils/response");
const ZoneSchema = require("../schemas/zone.schema");

const turnOncameraController = catchAsync(async (req, res) => {
    const {
    cameraId ,
    cameraCode,
      urlRtsp ,
      locationId ,
    } = req.body;

  const resolvedCameraCode = cameraId || cameraCode;

  if (!resolvedCameraCode || !urlRtsp || !locationId) {
        error({ message: "Missing values", code: StatusCodes.BAD_REQUEST });
    }

  const listZone = await ZoneSchema.getListZoneByCameraCode({
    locationId,
    cameraCode: resolvedCameraCode,
  });

  const result = await turnOnCamera({
    cameraId: resolvedCameraCode,
    urlRtsp,
    locationId,
    listZone,
  });
    
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
      error({ message: "Missing urlRtsp", code: StatusCodes.BAD_REQUEST });
    }

    const result = await turnOffCamera(urlRtsp);
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
