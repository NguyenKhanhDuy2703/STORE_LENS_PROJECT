const axiosInstance = require('./index');
const {error , success} = require('../utils/response')
const { StatusCodes } = require("http-status-codes");
const baseUrl = "/api/v1/tracking";
const turnOnCamera = async ({cameraId, urlRtsp, locationId , listZone}) => {
    try {
        console.log("Turning on camera with URL:", urlRtsp , "and zones:", listZone , "and cameraId:", cameraId, "and allocationId:", locationId);
        const response = await axiosInstance.post(`${baseUrl}/process`, {
            camera_id: String(cameraId),
            url_rtsp: String(urlRtsp),
            location_id: String(locationId),
            list_zone: listZone
        });
        return response.data;
    } catch (err) {
        if (err.response) {
            const responseData = err.response.data || {};
            console.error("Tracking API error response:", {
                status: err.response.status,
                data: responseData,
            });
            if (responseData.detail) {
                console.error("Tracking API validation detail:", JSON.stringify(responseData.detail, null, 2));
            }
            const apiMessage = responseData.message || responseData.detail || "Failed to turn on camera";
            error({ message: apiMessage, code: err.response.status || StatusCodes.INTERNAL_SERVER_ERROR });
        } else {
            console.error("Tracking API request failed:", err.message);
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
            const responseData = err.response.data || {};
            console.error("Tracking API error response:", {
                status: err.response.status,
                data: responseData,
            });
            const apiMessage = responseData.message || responseData.detail || "Failed to turn off camera";
            error({ message: apiMessage, code: err.response.status || StatusCodes.INTERNAL_SERVER_ERROR });
        } else {
            console.error("Tracking API request failed:", err.message);
            error({ message: err.message || "Failed to turn off camera", code: StatusCodes.INTERNAL_SERVER_ERROR });
        }
    }
}
module.exports = {
    turnOnCamera,
    turnOffCamera
}