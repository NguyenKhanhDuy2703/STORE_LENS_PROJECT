const zoneSchema = require('../schemas/zone.schema');
const zoneStatsSchema = require('../schemas/zoneStats.schema');
const SessionSchema = require('../schemas/session.schema');
const locationSchema = require('../schemas/location.schema');
const cameraSchema = require('../schemas/camera.schema');
const { dateUtil } = require('../utils/date.util');

const buildDateRangeFilter = ({ type, startCustom, endCustom, defaultType = 'today' } = {}) => {
    const filterType = type || ((startCustom || endCustom) ? 'custom' : defaultType);
    const { startDate, endDate } = dateUtil({
        type: filterType,
        startCustom,
        endCustom
    });

    return { $gte: startDate, $lte: endDate };
};

const zoneService = {
    async _preCheck({locationId , cameraCode}){
            const results = await Promise.all([
                locationSchema.findOne({ location_code: locationId }),
                cameraSchema.findOne({ camera_code: cameraCode, location_id: locationId }),
            ]);
            const [location, camera] = results;
            if(!location){
               throw new Error("Location not found");
            }
            if(!camera){
                throw new Error("Camera not found for the specified location");
            }
            return { location, camera };
    },
    
    async getZonesList ({locationId , cameraCode}){
        const { camera } = await this._preCheck({locationId , cameraCode});
        const listZones = await zoneSchema.find({ location_id: locationId, camera_id: cameraCode });

        const snapshotUrl = camera?.url_image_snapshot;
        if(!snapshotUrl){
            throw new Error("Background image not found for the specified camera");
        }
        if(!listZones || listZones.length === 0){
            throw new Error("No zones found for the specified location and camera");
        }
        return {
            snapshot_url: snapshotUrl,
            zones: listZones,
        };
    },
    async createAndUpdateZone({locationId , cameraCode , zoneName , zoneId , coordinates , categoryName  }){
        await this._preCheck({locationId , cameraCode});
        const result = await zoneSchema.updateOne({
            location_id : locationId,
            camera_id : cameraCode,
            zone_id : zoneId,
        },{
            $set: {
                zone_name : zoneName,
                category_name : categoryName,
                polygon_coordinates : coordinates ? coordinates : [],
            },
            $setOnInsert:{
                location_id : locationId,
                camera_id : cameraCode,
                zone_id : zoneId,
            }
        },{
            upsert: true,
        })
        return result;
    },
    async deleteZone({locationId , cameraCode , zoneId}){
        await this._preCheck({locationId , cameraCode});
        const result = await zoneSchema.deleteOne({
            location_id: locationId,
            camera_id : cameraCode,
            zone_id : zoneId,
        })
        return result;
    }
}
module.exports = zoneService;