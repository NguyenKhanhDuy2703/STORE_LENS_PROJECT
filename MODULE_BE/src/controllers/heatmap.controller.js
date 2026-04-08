const heatmapService = require("../service/heatmap.service");
const catchAsync = require("../utils/catchAsync");
const { error, success } = require("../utils/response");
const { StatusCodes } = require("http-status-codes");
const getHeatmapCntroller = catchAsync(async (req , res) => {
    const { locationId , cameraId } = req.params;
    const { type, startCustom, endCustom, date } = req.query;
    if(!locationId || !cameraId ){
        error({
            res,
            message: "Missing required parameters",
            code: StatusCodes.BAD_REQUEST,
        })
    }
    
    const heatmapData = await heatmapService.get({
        locationId,
        cameraId,
        type,
        startCustom,
        endCustom,
        date,
    });
    if(!heatmapData){
        return error({
            res,
            message: "No heatmap data found",
            code: StatusCodes.NOT_FOUND,
        });
    }
    success({
        res ,
        message: "Get heatmap data successfully",
        code: StatusCodes.OK,
        data: heatmapData,
    })
})
module.exports = {
    getHeatmapCntroller,
}