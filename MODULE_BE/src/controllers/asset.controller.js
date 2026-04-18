const { StatusCodes } = require("http-status-codes");
const catchAsync = require("../utils/catchAsync");
const { success, error } = require("../utils/response");
const assetService = require("../service/asset.service");

const getAssetController = catchAsync(async (req, res) => {
    const { locationId, categoryName, productId, zoneId, zoneName, page = 1, limit = 10 } = req.query;

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
        productId,
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
    const {
        locationId,
        categoryName: rawCategoryName,
        category_name,
        productId: rawProductId,
        product_id,
        nameProduct: rawNameProduct,
        name_product,
        zoneName: rawZoneName,
        zone_name,
        brand,
        price,
        unit,
        stockQuantity: rawStockQuantity,
        stock_quantity,
        status,
        assetAttributes: rawAssetAttributes,
        asset_attributes,
    } = req.body;

    const categoryName = rawCategoryName || category_name;
    const productId = rawProductId || product_id;
    const nameProduct = rawNameProduct || name_product;
    const zoneName = rawZoneName || zone_name;
    const stockQuantity = rawStockQuantity ?? stock_quantity;
    const assetAttributes = rawAssetAttributes || asset_attributes;

    if (!locationId || !productId) {
        return error({
            res,
            message: "Location ID and Product ID are required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const result = await assetService.addAndUpdateAsset({
        locationId,
        categoryName,
        productId,
        nameProduct,
        zoneName,
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
    const { locationId, productId } = req.query;

    if (!locationId || !productId) {
        return error({
            res,
            message: "Location ID and Product ID are required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const result = await assetService.deleteAsset({
        locationId,
        productId
    });

    return success({
        res,
        data: result,
        message: "Asset deleted successfully",
        code: StatusCodes.OK
    });
});

const getMestricAssetByLocationID = catchAsync(async (req, res) => {
    const locationId = req.query.locationId || req.query.location_id;

    if (!locationId) {
        return error({
            res,
            message: "Location ID is required",
            code: StatusCodes.BAD_REQUEST
        });
    }

    const result = await assetService.getMestric({ locationId });

    return success({
        res,
        data: result,
        message: "Asset metrics retrieved successfully",
        code: StatusCodes.OK
    });
});

const addAndUpdateAssetControllerWithValidation = catchAsync(async (req, res) => {
    try {
        return await addAndUpdateAssetController(req, res);
    } catch (err) {
        if (err?.message === "Category Name is required for a new asset") {
            return error({
                res,
                message: "Category Name is required for a new asset",
                code: StatusCodes.BAD_REQUEST
            });
        }
        throw err;
    }
});


module.exports = {
    getAssetController,
    addAndUpdateAssetController: addAndUpdateAssetControllerWithValidation,
    deleteAssetController,
    getMestricAssetByLocationID
};
