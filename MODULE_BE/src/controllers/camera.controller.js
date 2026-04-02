const { StatusCodes } = require("http-status-codes");
const { turnOnCamera, turnOffCamera } = require("../api/cameraAI.api");
const catchAsync = require("../utils/catchAsync");
const { success , error } = require("../utils/response");
mock_zones = [
    {
        "zone_id": "Zone_A",
        "points": [[100, 100], [500, 100], [500, 500], [100, 500]]
    },
    {
        "zone_id": "Zone_B",
        "points": [[600, 100], [1000, 100], [1000, 500], [600, 500]]
    }

]
const turnOncameraController = catchAsync(async (req, res) => {
    const {
      cameraId = 1,
      urlRtsp = "D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_1.mp4",
      locationId = 1,
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
module.exports = {
  turnOncameraController,
  tunrOffcameraController
};
