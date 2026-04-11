const buildCreateZonePayload = ({ locationCode, cameraCode, zoneSuffix = Date.now().toString() }) => ({
    locationId: locationCode,
    cameraCode,
    listZones: [
        {
            zoneName: 'Display Area',
            zoneId: `ZONE_${zoneSuffix}`,
            categoryName: 'retail_display',
            coordinates: JSON.stringify([
                [10, 20],
                [200, 20],
                [200, 180],
                [10, 180],
            ]),
        },
    ],
});

const buildZoneItem = ({
    zoneName,
    zoneId,
    categoryName = 'retail_display',
    coordinates = [
        [10, 20],
        [200, 20],
        [200, 180],
        [10, 180],
    ],
}) => ({
    zoneName,
    zoneId,
    categoryName,
    coordinates: JSON.stringify(coordinates),
});

const buildZoneBulkPayload = ({ locationCode, cameraCode, listZones }) => ({
    locationId: locationCode,
    cameraCode,
    listZones,
});

module.exports = {
    buildCreateZonePayload,
    buildZoneItem,
    buildZoneBulkPayload,
};
