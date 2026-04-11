const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../../src/app');
const Zone = require('../../../src/schemas/zone.schema');
const { version } = require('../../../src/config').getConfig().api;

const { createLocationAndCameraContext } = require('../../fixtures/domain.fixture');
const { buildCreateZonePayload } = require('../../fixtures/zone.fixture');

describe('Zone Create API - POST /zone', () => {
    test('TC-ZONE-01: should create zone successfully with valid payload', async () => {
        const { locationCode, cameraCode } = await createLocationAndCameraContext();
        const payload = buildCreateZonePayload({ locationCode, cameraCode });

        const response = await request(app)
            .post(`${version}/zone`)
            .send(payload);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Create or update zones successfully');

        const created = await Zone.findOne({
            location_id: locationCode,
            camera_id: cameraCode,
            zone_id: payload.listZones[0].zoneId,
        });

        expect(created).toBeTruthy();
        expect(created.zone_name).toBe(payload.listZones[0].zoneName);
    });

    test('TC-ZONE-02: should return bad request when listZones is missing', async () => {
        const { locationCode, cameraCode } = await createLocationAndCameraContext();

        const response = await request(app)
            .post(`${version}/zone`)
            .send({
                locationId: locationCode,
                cameraCode,
            });

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Invalid listZones parameter');
    });
});
