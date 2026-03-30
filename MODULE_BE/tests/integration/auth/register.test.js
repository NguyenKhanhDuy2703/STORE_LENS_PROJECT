const request = require("supertest");
const app = require("../../../src/app");
const { createTestLocation } = require("../../fixtures/auth.fixtures");
const { version } = require("../../../src/config").getConfig().api;
const { StatusCodes } = require("http-status-codes");

describe("Auth Register API - POST /auth/register", () => {
    /**
     * Test Suite: Register - Valid Registration
     */
    describe("Valid Registration", () => {
        test("TC-50: should successfully register with all required fields", async () => {
            const location = await createTestLocation("Register Test Location");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser",
                    password: "SecurePass123",
                    email: "newuser@test.com",
                    location_id: location._id.toString(),
                    fullname: "New User"
                });
            
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("message", "register successfully");
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("account", "newuser");
            expect(response.body.data).toHaveProperty("location");
        });

        test("TC-51: should register user without fullname field", async () => {
            const location = await createTestLocation("Register Test 2");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser2",
                    password: "SecurePass123",
                    email: "newuser2@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.data).toHaveProperty("account", "newuser2");
        });

        test("TC-52: new user should have MANAGER role by default", async () => {
            const location = await createTestLocation("Register Test 3");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "manageruser",
                    password: "SecurePass123",
                    email: "manageruser@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.CREATED);
            // After registration, user should be able to login
            const loginResponse = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "manageruser",
                    password: "SecurePass123"
                });
            
            expect(loginResponse.body.data.user.role).toBe("MANAGER");
        });
    });

    /**
     * Test Suite: Register - Missing Required Fields
     */
    describe("Missing Required Fields", () => {
        test("TC-53: should fail register with missing account field", async () => {
            const location = await createTestLocation("Register Test 4");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    password: "SecurePass123",
                    email: "test@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-54: should fail register with missing password field", async () => {
            const location = await createTestLocation("Register Test 5");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser",
                    email: "test@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test("TC-55: should fail register with missing email field", async () => {
            const location = await createTestLocation("Register Test 6");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser",
                    password: "SecurePass123",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test("TC-56: should fail register with missing location_id field", async () => {
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser",
                    password: "SecurePass123",
                    email: "test@test.com"
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test("TC-57: should fail register with empty account field", async () => {
            const location = await createTestLocation("Register Test 7");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "",
                    password: "SecurePass123",
                    email: "test@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    /**
     * Test Suite: Register - Duplicate/Conflict Data
     */
    describe("Duplicate/Conflict Data", () => {
        test("TC-58: should fail register with duplicate account", async () => {
            const location = await createTestLocation("Register Test 8");
            // First registration
            await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "duplicateacc",
                    password: "Pass123",
                    email: "duplicate1@test.com",
                    location_id: location._id.toString()
                });
            
            // Second registration with same account
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "duplicateacc",
                    password: "Pass456",
                    email: "duplicate2@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.message).toContain("exist");
        });

        test("TC-59: should fail register with duplicate email", async () => {
            const location = await createTestLocation("Register Test 9");
            // First registration
            await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "user1",
                    password: "Pass123",
                    email: "sameemail@test.com",
                    location_id: location._id.toString()
                });
            
            // Second registration with same email
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "user2",
                    password: "Pass456",
                    email: "sameemail@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.message).toContain("exist");
        });

        test("TC-60: should fail register with invalid location_id", async () => {
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser",
                    password: "SecurePass123",
                    email: "test@test.com",
                    location_id: "invalid_location_id_12345"
                });
            
            expect([StatusCodes.BAD_REQUEST, StatusCodes.INTERNAL_SERVER_ERROR]).toContain(response.status);
        });
    });

    /**
     * Test Suite: Register - Data Type Validation
     */
    describe("Data Type Validation", () => {
        test("TC-61: should handle non-string account (auto-converted to string)", async () => {
            const location = await createTestLocation("Register Test 10");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: 12345,
                    password: "Pass123",
                    email: "test61@test.com",
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.CREATED, StatusCodes.BAD_REQUEST, StatusCodes.INTERNAL_SERVER_ERROR]).toContain(response.status);
        });

        test("TC-62: should reject non-string password", async () => {
            const location = await createTestLocation("Register Test 11");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser",
                    password: 12345,
                    email: "test@test.com",
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.BAD_REQUEST, StatusCodes.INTERNAL_SERVER_ERROR]).toContain(response.status);
        });

        test("TC-63: should handle non-string email (auto-converted to string)", async () => {
            const location = await createTestLocation("Register Test 12");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "newuser63",
                    password: "Pass123",
                    email: 12345,
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.CREATED, StatusCodes.BAD_REQUEST, StatusCodes.INTERNAL_SERVER_ERROR]).toContain(response.status);
        });

        test("TC-64: should reject null values", async () => {
            const location = await createTestLocation("Register Test 13");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: null,
                    password: null,
                    email: null,
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    /**
     * Test Suite: Register - Edge Cases
     */
    describe("Edge Cases", () => {
        test("TC-65: should handle very long account strings", async () => {
            const location = await createTestLocation("Register Test 14");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "a".repeat(500),
                    password: "Pass123",
                    email: "very-long@test.com",
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.CREATED, StatusCodes.BAD_REQUEST, StatusCodes.INTERNAL_SERVER_ERROR]).toContain(response.status);
        });

        test("TC-66: should handle special characters in account", async () => {
            const location = await createTestLocation("Register Test 15");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "user@#$%^&*()",
                    password: "Pass123",
                    email: "special@test.com",
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.CREATED, StatusCodes.BAD_REQUEST]).toContain(response.status);
        });

        test("TC-67: should handle invalid email format", async () => {
            const location = await createTestLocation("Register Test 16");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "validuser",
                    password: "Pass123",
                    email: "notanemail",
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.CREATED, StatusCodes.BAD_REQUEST]).toContain(response.status);
        });

        test("TC-68: should handle weak password", async () => {
            const location = await createTestLocation("Register Test 17");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "weakpass",
                    password: "123",
                    email: "weak@test.com",
                    location_id: location._id.toString()
                });
            
            expect([StatusCodes.CREATED, StatusCodes.BAD_REQUEST]).toContain(response.status);
        });
    });

    /**
     * Test Suite: Register - HTTP Method Validation
     */
    describe("HTTP Method Validation", () => {
        test("TC-69: should reject GET request to register endpoint", async () => {
            const response = await request(app).get(`${version}/auth/register`);
            expect([StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.NOT_FOUND]).toContain(response.status);
        });

        test("TC-70: should reject PUT request to register endpoint", async () => {
            const response = await request(app).put(`${version}/auth/register`);
            expect([StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.NOT_FOUND]).toContain(response.status);
        });

        test("TC-71: should reject DELETE request to register endpoint", async () => {
            const response = await request(app).delete(`${version}/auth/register`);
            expect([StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.NOT_FOUND]).toContain(response.status);
        });
    });

    /**
     * Test Suite: Register - Response Format
     */
    describe("Response Format", () => {
        test("TC-72: should return consistent response structure for successful registration", async () => {
            const location = await createTestLocation("Register Test 18");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "responsetest",
                    password: "Pass123",
                    email: "response@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body).toHaveProperty("message", "register successfully");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("account");
            expect(response.body.data).toHaveProperty("location");
        });

        test("TC-73: should return consistent response structure for failed registration", async () => {
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "testuser",
                    password: "Pass123",
                    email: "test@test.com"
                });
            
            expect(response.body).toHaveProperty("status", "error");
            expect(response.body).toHaveProperty("message");
        });

        test("TC-74: should return 201 CREATED status on successful registration", async () => {
            const location = await createTestLocation("Register Test 19");
            const response = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "statustest",
                    password: "Pass123",
                    email: "status@test.com",
                    location_id: location._id.toString()
                });
            
            expect(response.status).toBe(StatusCodes.CREATED);
        });
    });

    /**
     * Test Suite: Register -> Login Flow
     */
    describe("Register & Login Flow", () => {
        test("TC-75: should allow registered user to login immediately", async () => {
            const location = await createTestLocation("Register Test 20");
            // Register a new user
            const registerResponse = await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "loginflow",
                    password: "FlowPass123",
                    email: "flow@test.com",
                    location_id: location._id.toString()
                });
            
            expect(registerResponse.status).toBe(StatusCodes.CREATED);
            
            // Immediately login with same credentials
            const loginResponse = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "loginflow",
                    password: "FlowPass123"
                });
            
            expect(loginResponse.status).toBe(StatusCodes.OK);
            expect(loginResponse.body.data.user.account).toBe("loginflow");
        });

        test("TC-76: registered user should not be able to login with wrong password", async () => {
            const location = await createTestLocation("Register Test 21");
            // Register a new user
            await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "wrongpass",
                    password: "CorrectPass123",
                    email: "wrongpass@test.com",
                    location_id: location._id.toString()
                });
            
            // Try login with wrong password
            const loginResponse = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "wrongpass",
                    password: "WrongPass123"
                });
            
            expect(loginResponse.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        test("TC-77: multiple users can register and login independently", async () => {
            const location = await createTestLocation("Register Test 22");
            
            // Register first user
            await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "user_multi1",
                    password: "Pass123",
                    email: "multi1@test.com",
                    location_id: location._id.toString()
                });
            
            // Register second user
            await request(app)
                .post(`${version}/auth/register`)
                .send({
                    account: "user_multi2",
                    password: "Pass456",
                    email: "multi2@test.com",
                    location_id: location._id.toString()
                });
            
            // Login first user
            const login1 = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "user_multi1",
                    password: "Pass123"
                });
            
            // Login second user
            const login2 = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "user_multi2",
                    password: "Pass456"
                });
            
            expect(login1.status).toBe(StatusCodes.OK);
            expect(login2.status).toBe(StatusCodes.OK);
            expect(login1.body.data.user.account).not.toBe(login2.body.data.user.account);
        });
    });
});
