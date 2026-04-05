const catchAsync = require('../utils/catchAsync');
const {error  , success} = require("../utils/response")
const {StatusCodes} = require("http-status-codes");
const locationStatsWorker = require("../workers/locationStats.worker")
const zoneStatsWorker = require("../workers/zoneStats.worker")
const asyncLocationStasController = catchAsync( async (req , res) => {
    const { locationId } = req.params;
    if (!locationId){
        error({
            res,
            message : "locationId is required",
            code : StatusCodes.BAD_REQUEST
        })
    }
    await locationStatsWorker.process(locationId);
    success(
        {
        res,
        data : null,
        message :"async location stats",
        code : StatusCodes.OK,
        }
    )
})
const  asyncZoneStatsController = catchAsync( async (req , res) => {
        const { locationId , zoneId } = req.params;
        if (!locationId || !zoneId){
            error({
                res,
                message : "locationId and zoneId are required",
                code : StatusCodes.BAD_REQUEST
            })
        }
        await zoneStatsWorker.process({locationId , zoneId})
        success({
            res,
            data : null,
            message :"async zone stats",
            code : StatusCodes.OK,
        })

})
module.exports = {
    asyncLocationStasController,
    asyncZoneStatsController
}