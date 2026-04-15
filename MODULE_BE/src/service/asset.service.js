const assetSchema = require('../schemas/asset.schema');
const zoneSchema = require('../schemas/zone.schema');

const assetService = {
    async getAsset({ locationId, categoryName, zoneId, zoneName, page = 1, limit = 10 }) {
        const query = { location_id: locationId };

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
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    async addAndUpdateAsset({ locationId, categoryName, nameProduct, brand, price, unit, stockQuantity, status, assetAttributes }) {
        const result = await assetSchema.updateOne(
            {
                location_id: locationId,
                category_name: categoryName
            },
            {
                $set: {
                    name_product: nameProduct,
                    brand,
                    price: price || 0,
                    unit,
                    stock_quantity: stockQuantity || 0,
                    status: status !== undefined ? status : true,
                    asset_attributes: assetAttributes || {}
                },
                $setOnInsert: {
                    location_id: locationId,
                    category_name: categoryName
                }
            },
            {
                upsert: true
            }
        );

        return result;
    },

    async deleteAsset({ locationId, categoryName }) {
        const result = await assetSchema.deleteOne({
            location_id: locationId,
            category_name: categoryName
        });

        return result;
    }
}

module.exports = assetService;