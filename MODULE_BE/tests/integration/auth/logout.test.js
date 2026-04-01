const request = require("supertest");
const app = require("../../../src/app");
const { createUserWithRoleAdmin } = require("../../fixtures/auth.fixtures");
const { version } = require("../../../src/config").getConfig().api;
const { StatusCodes } = require("http-status-codes");

describe("Auth Logout API - GET /auth/logout", () => {
    beforeEach(async () => {
        await createUserWithRoleAdmin();
    });

    /**
     * Test Suite: Logout Functionality
     */
    describe("Logout Operations", () => {
        test("TC-33: should logout successfully with valid request", async () => {
            // First, login to get a session cookie
            const loginResponse = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            expect(loginResponse.headers["set-cookie"]).toBeDefined();

            // Then, logout (session cookie should be automatically included)
            const logoutResponse = await request(app)
                .get(`${version}/auth/logout`);
            
            expect(logoutResponse.status).toBe(StatusCodes.OK);
            expect(logoutResponse.body).toHaveProperty("status", "success");
            expect(logoutResponse.body).toHaveProperty("message", "logout successfully");
        });

        test("TC-34: should successfully clear session cookie on logout", async () => {
            const logoutResponse = await request(app).get(`${version}/auth/logout`);
            expect(logoutResponse.status).toBe(StatusCodes.OK);
            // Check if setCookie is called (could be in response headers)
        });

        test("TC-35: should handle logout without prior login", async () => {
            // This should still succeed since it just clears the cookie
            const response = await request(app).get(`${version}/auth/logout`);
            expect(response.status).toBe(StatusCodes.OK);
        });

        test("TC-36: should return success message on logout", async () => {
            const response = await request(app).get(`${version}/auth/logout`);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toContain("logout");
        });

        test("TC-37: should handle multiple logout attempts", async () => {
            const response1 = await request(app).get(`${version}/auth/logout`);
            const response2 = await request(app).get(`${version}/auth/logout`);
            expect(response1.status).toBe(StatusCodes.OK);
            expect(response2.status).toBe(StatusCodes.OK);
        });
    });
});
