const request = require('supertest');
const { StatusCodes } = require('http-status-codes');

const app = require('../../../src/app');
const Zone = require('../../../src/schemas/zone.schema');
const { version } = require('../../../src/config').getConfig().api;

const { createLocationAndCameraContext } = require('../../fixtures/domain.fixture');

describe('Zone Delete API - DELETE /zone', () => {
    test('TC-ZONE-DEL-01: should delete zone successfully', async () => {
        const { locationCode, cameraCode } = await createLocationAndCameraContext();

        await Zone.create({
            location_id: locationCode,
            camera_id: cameraCode,
            zone_name: 'Delete Zone',
            zone_id: 'ZONE_DEL_1',
            category_name: 'retail_display',
            polygon_coordinates: [
                [10, 20],
                [200, 20],
                [200, 180],
                [10, 180],
            ],
        });

        const response = await request(app)
            .delete(`${version}/zone`)
            .send({
                locationId: locationCode,
                cameraCode,
                zoneId: 'ZONE_DEL_1',
            });

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Delete zone successfully');

        const deleted = await Zone.findOne({
            location_id: locationCode,
            camera_id: cameraCode,
            zone_id: 'ZONE_DEL_1',
        });

        expect(deleted).toBeNull();
    });

    test('TC-ZONE-DEL-02: should return bad request when zoneId is missing', async () => {
        const { locationCode, cameraCode } = await createLocationAndCameraContext();

        const response = await request(app)
            .delete(`${version}/zone`)
            .send({
                locationId: locationCode,
                cameraCode,
            });

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty('status', 'error');
        expect(response.body).toHaveProperty('message', 'Missing required parameters');
    });
});
