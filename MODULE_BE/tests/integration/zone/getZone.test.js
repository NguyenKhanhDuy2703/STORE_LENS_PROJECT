const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../../src/app');
const Zone = require('../../../src/schemas/zone.schema');
const { version } = require('../../../src/config').getConfig().api;

const { createLocationAndCameraContext } = require('../../fixtures/domain.fixture');

describe('Zone Get API - GET /zone', () => {
    test('TC-ZONE-GET-01: should get list zones by locationId and cameraCode', async () => {
        const { locationCode, cameraCode } = await createLocationAndCameraContext();

        await Zone.create({
            location_id: locationCode,
            camera_id: cameraCode,
            zone_name: 'Get Zone A',
            zone_id: 'ZONE_GET_1',
            category_name: 'retail_display',
            polygon_coordinates: [
                [10, 20],
                [200, 20],
                [200, 180],
                [10, 180],
            ],
        });

        const response = await request(app)
            .get(`${version}/zone`)
            .query({
                locationId: locationCode,
                cameraCode,
            });

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Get list zones successfully');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0]).toHaveProperty('zone_id', 'ZONE_GET_1');
    });

    test('TC-ZONE-GET-02: should return bad request when query is missing', async () => {
        const response = await request(app).get(`${version}/zone`);

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Missing required parameters');
    });
});
