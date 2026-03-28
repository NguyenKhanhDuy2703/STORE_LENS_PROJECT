const axiosInstance = require('./index');
const {error , success} = require('../utils/response')
const { StatusCodes } = require("http-status-codes");
const baseUrl = "api/v1/tracking"
const turnOnCamera = async ({cameraId, urlRtsp, allocationId , listZone}) => {
    try {
        console.log("Turning on camera with URL:", urlRtsp , "and zones:", listZone , "and cameraId:", cameraId, "and allocationId:", allocationId);
        const response = await axiosInstance.post(`${baseUrl}/process`, {
            camera_id: cameraId,
            url_rtsp: urlRtsp,
            allocation_id: allocationId,
            list_zone: listZone
        });
        return response.data;
    } catch (err) {
        if (err.response) {
            error({ message: err.response.data.message || "Failed to turn on camera", code: err.response.status || StatusCodes.INTERNAL_SERVER_ERROR });
        } else {
            error({ message: err.message || "Failed to turn on camera", code: StatusCodes.INTERNAL_SERVER_ERROR });
        }
    }
}
const turnOffCamera = async (urlRtsp) => {
    try {
        const response = await axiosInstance.get(`${baseUrl}/stopped`, {
           params:{
            url_rtsp: urlRtsp
           }
        });
        return response.data;
    } catch (err) {
        if (err.response) {
            error({ message: err.response.data.message || "Failed to turn off camera", code: err.response.status || StatusCodes.INTERNAL_SERVER_ERROR });
        } else {
            error({ message: err.message || "Failed to turn off camera", code: StatusCodes.INTERNAL_SERVER_ERROR });
        }
    }
}
module.exports = {
    turnOnCamera,
    turnOffCamera
}