const axiosInstance = require('./index');
const {error , success} = require('../utils/response')
const { StatusCodes } = require("http-status-codes");
const baseUrl = "/api/v1/tracking";
const turnOnCamera = async ({cameraId, urlRtsp, locationId , listZone}) => {
    try {
        const response = await axiosInstance.post(`${baseUrl}/process/`, {
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
            const apiError = new Error(apiMessage);
            apiError.statusCode = err.response.status || StatusCodes.INTERNAL_SERVER_ERROR;
            throw apiError;
        } else {
            console.error("Tracking API request failed:", err.message);
            const apiError = new Error(err.message || "Failed to turn on camera");
            apiError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            throw apiError;
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
            const apiError = new Error(apiMessage);
            apiError.statusCode = err.response.status || StatusCodes.INTERNAL_SERVER_ERROR;
            throw apiError;
        } else {
            console.error("Tracking API request failed:", err.message);
            const apiError = new Error(err.message || "Failed to turn off camera");
            apiError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
            throw apiError;
        }
    }
}
module.exports = {
    turnOnCamera,
    turnOffCamera
}