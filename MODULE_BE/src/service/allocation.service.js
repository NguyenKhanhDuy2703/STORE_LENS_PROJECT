const locationSchema = require("../schemas/location.schema");
const locationService =  {
    getLocation : async (locationId) => {
        let listLocations = []
        if(locationId){
            const listLocations = await locationSchema.findOne({ location_code: locationId });
        }
        listLocations = await locationSchema.find({});
        return listLocations;
    }
}
module.exports = locationService;