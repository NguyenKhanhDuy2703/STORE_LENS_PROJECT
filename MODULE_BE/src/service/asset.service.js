const assetSchema = require('../schemas/asset.schema');
const zoneSchema = require('../schemas/zone.schema');

const assetService = {
    async getAsset({ locationId, categoryName, productId, zoneId, zoneName, page = 1, limit = 10 }) {
        const query = { location_id: locationId };

        if (productId) {
            query.product_id = productId;
        }

        if (zoneId || zoneName) {
            const zoneQuery = { location_id: locationId };
            
            if (zoneId) {
                zoneQuery.zone_id = zoneId;
            }
            if (zoneName) {
                zoneQuery.zone_name = zoneName;
            }

            const zone = await zoneSchema.findOne(zoneQuery);
            if (zone?.category_name) {
                query.category_name = zone.category_name;
            }
        }

        if (categoryName) {
            query.category_name = categoryName;
        }

        const skip = (page - 1) * limit;
        const total = await assetSchema.countDocuments(query);
        const data = await assetSchema.find(query).skip(skip).limit(limit);

        return {
            listAsset: data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    },

    async addAndUpdateAsset({ locationId, categoryName, productId, nameProduct, zoneName, brand, price, unit, stockQuantity, status, assetAttributes }) {
        
        const result = await assetSchema.updateOne(
            {
                location_id: locationId,
                product_id: productId
            },
            {
                $set: {
                    product_id: productId,
                    category_name: categoryName,
                    name_product: nameProduct,
                    zone_name: zoneName || "",
                    brand,
                    price: price || 0,
                    unit,
                    stock_quantity: stockQuantity || 0,
                    status: status !== undefined ? status : true,
                    asset_attributes: assetAttributes || {}
                },
            },
            {
                upsert: true
            }
        );

        return result;
    },

    async deleteAsset({ locationId, productId }) {
        if (!locationId || !productId) {
            throw new Error("Location ID and Product ID are required for deletion");
        }
        const result = await assetSchema.deleteOne({ location_id: locationId, product_id: productId });

        return result;
    },

    async getMestric({ locationId }) {
        const baseQuery = { location_id: locationId };

        const [
            totalProduct,
            activeProduct,
            outOfStockProduct,
            inventoryValueResult,
        ] = await Promise.all([
            assetSchema.countDocuments(baseQuery),
            assetSchema.countDocuments({ ...baseQuery, status: true }),
            assetSchema.countDocuments({ ...baseQuery, stock_quantity: 0 }),
            assetSchema.aggregate([
                { $match: baseQuery },
                {
                    $group: {
                        _id: null,
                        totalInventoryValue: {
                            $sum: {
                                $multiply: [
                                    { $ifNull: ["$price", 0] },
                                    { $ifNull: ["$stock_quantity", 0] },
                                ],
                            },
                        },
                    },
                },
            ]),
        ]);

        return {
            totalProduct,
            activeProduct,
            outOfStockProduct,
            totalInventoryValue: inventoryValueResult[0]?.totalInventoryValue || 0,
        };
    },
    
}

module.exports = assetService;