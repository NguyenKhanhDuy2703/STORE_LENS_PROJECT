const zoneService = require('../service/zone.service');
const catchAsync = require('../utils/catchAsync');
const { error, success } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');
const cameraService = require("../service/camera.service");



const getListZoneController = catchAsync(async (req, res) => {
    const { locationId , cameraCode } = req.query;
    console.log("Received request to get list zones with locationId: ", locationId, " and cameraCode: ", cameraCode);
    if(!locationId || !cameraCode){
        return error({
            res,
            message: "Missing required parameters",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    const listZones = await zoneService.getZonesList({locationId , cameraCode});
    success({
        res,
        message: "Get list zones successfully",
        code: StatusCodes.OK,
        data: listZones,
    })
});
const createAndUpdateZoneController = catchAsync(async (req, res) => {
    const { locationId , cameraCode , listZones , imgUrl } = req.body;
    if(!locationId || !cameraCode ){
        return error({
            res,
            message: "Missing required parameters",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    if(!listZones || !Array.isArray(listZones) ){
        return error({
            res,
            message: "Invalid listZones parameter",
            code: StatusCodes.BAD_REQUEST,
        })
    }   
    if(imgUrl){
        await cameraService.updateCameraImage({cameraCode , locationId , imgUrl});
    }
    const results = await Promise.allSettled(listZones.map( zone => {
        const cordinates = zone.coordinates ? JSON.parse(zone.coordinates) : [];
        return zoneService.createAndUpdateZone({
            locationId,
            cameraCode,
            zoneName : zone.zoneName,
            zoneId : zone.zoneId,
            coordinates : cordinates,
            categoryName : zone.categoryName,
        })
    }))
    if(results.some(result => result.status === "rejected")){
        return error({
            res,
            message: "Error occurred while creating/updating zones",
            code: StatusCodes.INTERNAL_SERVER_ERROR,
        })
    }
    success({
        res,
        message: "Create or update zones successfully",
        code: StatusCodes.OK,
        data: {
            total: listZones.length,
        },
    })
}
);
const deleteZoneController = catchAsync(async (req, res) => {
    const { locationId , cameraCode , zoneId } = req.body;
    console.log("Received request to delete zone with locationId: ", locationId, " cameraCode: ", cameraCode, " zoneId: ", zoneId);
    if(!locationId || !cameraCode || !zoneId){
        return error({
            res,
            message: "Missing required parameters",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    const result = await zoneService.deleteZone({locationId , cameraCode , zoneId});
    success({
        res,
        message: "Delete zone successfully",
        code: StatusCodes.OK,
        data: result,
    })
});
module.exports = {
    getListZoneController,
    createAndUpdateZoneController,
    deleteZoneController,
}