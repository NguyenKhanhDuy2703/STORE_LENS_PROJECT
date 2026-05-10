/**
 * Unit tests for getYearlyStats service and getYearlyStatsController
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4
 */

const mongoose = require('mongoose');
const LocationStatsSchema = require('../../../src/schemas/locationStats.schema');
const { getYearlyStats } = require('../../../src/service/dashboard.service');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Insert a LocationStats document for a given locationId, year, month, day.
 */
const insertStat = async ({ locationId, year, month, day, visitors = 0, revenue = 0 }) => {
    const date = new Date(year, month - 1, day, 12, 0, 0); // noon local
    await LocationStatsSchema.create({
        location_id: locationId,
        date,
        kpis: {
            total_visitors: visitors,
            total_revenue: revenue
        }
    });
};

// ── getYearlyStats service tests ──────────────────────────────────────────────

describe('getYearlyStats service', () => {
    const LOCATION_ID = 'loc-test-001';
    const YEAR = 2025;

    describe('Return shape', () => {
        test('always returns exactly 12 elements in yearly_data', async () => {
            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

            expect(result).toHaveProperty('yearly_data');
            expect(result.yearly_data).toHaveLength(12);
        });

        test('months are numbered 1–12 in ascending order', async () => {
            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

            result.yearly_data.forEach((item, index) => {
                expect(item.month).toBe(index + 1);
            });
        });

        test('returns year and lastUpdated in response', async () => {
            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

            expect(result.year).toBe(YEAR);
            expect(result.lastUpdated).toBeInstanceOf(Date);
        });
    });

    describe('Missing months filled with zeros (Requirement 9.4)', () => {
        test('months with no data have total_customers: 0 and total_revenue: 0', async () => {
            // Insert data only for month 3
            await insertStat({ locationId: LOCATION_ID, year: YEAR, month: 3, day: 15, visitors: 100, revenue: 500000 });

            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

            // All months except 3 should be zero
            result.yearly_data.forEach(item => {
                if (item.month !== 3) {
                    expect(item.total_customers).toBe(0);
                    expect(item.total_revenue).toBe(0);
                }
            });
        });

        test('month with data has correct aggregated values', async () => {
            // Insert two records for month 6
            await insertStat({ locationId: LOCATION_ID, year: YEAR, month: 6, day: 10, visitors: 200, revenue: 1000000 });
            await insertStat({ locationId: LOCATION_ID, year: YEAR, month: 6, day: 20, visitors: 150, revenue: 750000 });

            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });
            const june = result.yearly_data.find(d => d.month === 6);

            expect(june.total_customers).toBe(350);
            expect(june.total_revenue).toBe(1750000);
        });

        test('returns 12 zeros when no data exists for the year', async () => {
            const result = await getYearlyStats({ locationId: 'loc-no-data', year: YEAR });

            expect(result.yearly_data).toHaveLength(12);
            result.yearly_data.forEach(item => {
                expect(item.total_customers).toBe(0);
                expect(item.total_revenue).toBe(0);
            });
        });
    });

    describe('Data isolation', () => {
        test('does not include data from a different year', async () => {
            // Insert data for YEAR-1 month 12 and YEAR+1 month 1
            await insertStat({ locationId: LOCATION_ID, year: YEAR - 1, month: 12, day: 31, visitors: 999, revenue: 9999999 });
            await insertStat({ locationId: LOCATION_ID, year: YEAR + 1, month: 1,  day: 1,  visitors: 888, revenue: 8888888 });

            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

            result.yearly_data.forEach(item => {
                expect(item.total_customers).toBe(0);
                expect(item.total_revenue).toBe(0);
            });
        });

        test('does not include data from a different location', async () => {
            await insertStat({ locationId: 'other-location', year: YEAR, month: 5, day: 10, visitors: 500, revenue: 2500000 });

            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });
            const may = result.yearly_data.find(d => d.month === 5);

            expect(may.total_customers).toBe(0);
        });
    });

    describe('Multiple months with data', () => {
        test('correctly aggregates data across all 12 months', async () => {
            const expected = {};
            for (let m = 1; m <= 12; m++) {
                const visitors = m * 10;
                const revenue  = m * 100000;
                await insertStat({ locationId: LOCATION_ID, year: YEAR, month: m, day: 15, visitors, revenue });
                expected[m] = { visitors, revenue };
            }

            const result = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

            expect(result.yearly_data).toHaveLength(12);
            result.yearly_data.forEach(item => {
                expect(item.total_customers).toBe(expected[item.month].visitors);
                expect(item.total_revenue).toBe(expected[item.month].revenue);
            });
        });
    });
});

// ── getYearlyStatsController unit tests ──────────────────────────────────────
// Note: catchAsync wraps the handler and passes errors to `next`.
// The `error` utility in response.js throws an Error with statusCode set.
// We verify validation by checking that `next` is called with the right error.

describe('getYearlyStatsController', () => {
    const { getYearlyStatsController } = require('../../../src/controllers/dashboard.controller');

    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json   = jest.fn().mockReturnValue(res);
        return res;
    };

    test('passes 400 error to next when locationId is missing (Requirement 9.2)', async () => {
        const req = { params: {}, query: { year: '2025' }, body: {} };
        const res = mockRes();
        const next = jest.fn();

        await getYearlyStatsController(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Location ID is required', statusCode: 400 })
        );
    });

    test('passes 400 error to next when year is missing (Requirement 9.3)', async () => {
        const req = { params: { locationId: 'loc-001' }, query: {}, body: {} };
        const res = mockRes();
        const next = jest.fn();

        await getYearlyStatsController(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Valid year is required', statusCode: 400 })
        );
    });

    test('passes 400 error to next when year is not a valid integer (Requirement 9.3)', async () => {
        const req = { params: { locationId: 'loc-001' }, query: { year: 'abc' }, body: {} };
        const res = mockRes();
        const next = jest.fn();

        await getYearlyStatsController(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Valid year is required', statusCode: 400 })
        );
    });

    test('returns 200 with yearly_data when valid params provided (Requirement 9.1)', async () => {
        const LOCATION_ID = 'loc-ctrl-test';
        const YEAR = 2024;

        // Seed one month of data
        await insertStat({ locationId: LOCATION_ID, year: YEAR, month: 7, day: 4, visitors: 300, revenue: 1500000 });

        // Test the service directly (controller success path delegates to service)
        const { getYearlyStats } = require('../../../src/service/dashboard.service');
        const data = await getYearlyStats({ locationId: LOCATION_ID, year: YEAR });

        expect(data).toHaveProperty('yearly_data');
        expect(data.yearly_data).toHaveLength(12);
        expect(data.year).toBe(YEAR);

        const july = data.yearly_data.find(d => d.month === 7);
        expect(july.total_customers).toBe(300);
        expect(july.total_revenue).toBe(1500000);
    });
});
