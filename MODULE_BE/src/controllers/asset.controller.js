const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const assetService = require("../service/asset.service");

const getAssetController = catchAsync(async (req, res) => {
    const { locationId, categoryName, zoneId, zoneName, page = 1, limit = 10 } = req.query;

    if (!locationId) {
        return error({
            res,
            message: "Location ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const result = await assetService.getAsset({
        locationId,
        categoryName,
        zoneId,
        zoneName,
        page: parseInt(page),
        limit: parseInt(limit)
    });

    return success({
        res,
        data: result,
        message: "Assets retrieved successfully",
        code: StatusCodes.OK
    });
});

const addAndUpdateAssetController = catchAsync(async (req, res) => {
    const { locationId, categoryName, nameProduct, brand, price, unit, stockQuantity, status, assetAttributes } = req.body;

    if (!locationId || !categoryName) {
        return error({
            res,
            message: "Location ID and Category Name are required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const result = await assetService.addAndUpdateAsset({
        locationId,
        categoryName,
        nameProduct,
        brand,
        price,
        unit,
        stockQuantity,
        status,
        assetAttributes
    });

    return success({
        res,
        data: result,
        message: "Asset added/updated successfully",
        code: StatusCodes.OK
    });
});

const deleteAssetController = catchAsync(async (req, res) => {
    const { locationId, categoryName } = req.query;

    if (!locationId || !categoryName) {
        return error({
            res,
            message: "Location ID and Category Name are required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const result = await assetService.deleteAsset({
        locationId,
        categoryName
    });

    return success({
        res,
        data: result,
        message: "Asset deleted successfully",
        code: StatusCodes.OK
    });
});

module.exports = {
    getAssetController,
    addAndUpdateAssetController,
    deleteAssetController
};
