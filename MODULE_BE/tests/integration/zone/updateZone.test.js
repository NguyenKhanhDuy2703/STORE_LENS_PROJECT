const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../../src/app');
const Zone = require('../../../src/schemas/zone.schema');
const { version } = require('../../../src/config').getConfig().api;

const { createLocationAndCameraContext } = require('../../fixtures/domain.fixture');
const { buildZoneItem, buildZoneBulkPayload } = require('../../fixtures/zone.fixture');

describe('Zone Update API - POST /zone with listZones[]', () => {
    test('TC-ZONE-UPD-01: should update zones when listZones is an array payload', async () => {
        const { locationCode, cameraCode } = await createLocationAndCameraContext();

        const createPayload = buildZoneBulkPayload({
            locationCode,
            cameraCode,
            listZones: [
                buildZoneItem({
                    zoneName: 'Initial Zone A',
                    zoneId: 'ZONE_UPDATE_1',
                    categoryName: 'retail_display',
                }),
                buildZoneItem({
                    zoneName: 'Initial Zone B',
                    zoneId: 'ZONE_UPDATE_2',
                    categoryName: 'checkout',
                }),
            ],
        });

        const createResponse = await request(app)
            .post(`${version}/zone`)
            .send(createPayload);

        expect(createResponse.status).toBe(StatusCodes.OK);

        const updatePayload = buildZoneBulkPayload({
            locationCode,
            cameraCode,
            listZones: [
                buildZoneItem({
                    zoneName: 'Updated Zone A',
                    zoneId: 'ZONE_UPDATE_1',
                    categoryName: 'smartphone',
                    coordinates: [
                        [50, 60],
                        [300, 60],
                        [300, 210],
                        [50, 210],
                    ],
                }),
                buildZoneItem({
                    zoneName: 'Updated Zone B',
                    zoneId: 'ZONE_UPDATE_2',
                    categoryName: 'laptop',
                    coordinates: [
                        [80, 90],
                        [260, 90],
                        [260, 200],
                        [80, 200],
                    ],
                }),
            ],
        });

        const updateResponse = await request(app)
            .post(`${version}/zone`)
            .send(updatePayload);

        expect(updateResponse.status).toBe(StatusCodes.OK);
        expect(updateResponse.body).toHaveProperty('status', 'success');
        expect(updateResponse.body.data).toHaveProperty('total', 2);

        const updatedA = await Zone.findOne({
            location_id: locationCode,
            camera_id: cameraCode,
            zone_id: 'ZONE_UPDATE_1',
        });
        const updatedB = await Zone.findOne({
            location_id: locationCode,
            camera_id: cameraCode,
            zone_id: 'ZONE_UPDATE_2',
        });

        expect(updatedA).toBeTruthy();
        expect(updatedB).toBeTruthy();
        expect(updatedA.zone_name).toBe('Updated Zone A');
        expect(updatedB.zone_name).toBe('Updated Zone B');
        expect(updatedA.category_name).toBe('smartphone');
        expect(updatedB.category_name).toBe('laptop');
    });
});
