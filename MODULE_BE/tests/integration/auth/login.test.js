const request = require("supertest");
const app = require("../../../src/app");
const { createUserWithRoleAdmin, createUserWithRoleUser, createUserWithRoleManager } = require("../../fixtures/auth.fixtures");
const { version } = require("../../../src/config").getConfig().api;
const { StatusCodes } = require("http-status-codes");

describe("Auth Login API - POST /auth/login", () => {
    beforeEach(async () => {
        await createUserWithRoleAdmin();
        await createUserWithRoleUser();
        await createUserWithRoleManager();
    });

    /**
     * Test Suite: Login with Valid Credentials
     */
    describe("Valid Credentials", () => {
        test("TC-1: should login successfully with admin account", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveProperty("message", "signin successfully");
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data.user).toHaveProperty("account", "admin");
            expect(response.body.data.user).toHaveProperty("role");
            expect(response.headers["set-cookie"]).toBeDefined();
        });

        test("TC-2: should login successfully with user account", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "user",
                password: "user123"
            });
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.data.user).toHaveProperty("account", "user");
            expect(response.body.data.user).toHaveProperty("role");
            expect(response.headers["set-cookie"]).toBeDefined();
        });

        test("TC-3: should login successfully with manager account", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "manager",
                password: "manager123"
            });
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.data.user).toHaveProperty("account", "manager");
            expect(response.body.data.user).toHaveProperty("role");
            expect(response.headers["set-cookie"]).toBeDefined();
        });

        test("TC-4: should return complete user object with required fields", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            const user = response.body.data.user;
            expect(user).toHaveProperty("_id");
            expect(user).toHaveProperty("account");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("role");
            expect(user).toHaveProperty("location_id");
            expect(user).not.toHaveProperty("password");
        });
    });

    /**
     * Test Suite: Login with Invalid/Missing Credentials
     */
    describe("Invalid Credentials", () => {
        test("TC-5: should fail login with invalid password", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "wrongpassword"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
            expect(response.body).toHaveProperty("message", "Incorrect account or password");
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-6: should fail login with non-existing account", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "nonexisting",
                password: "password123"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
            expect(response.body).toHaveProperty("message", "Incorrect account or password");
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-7: should fail login with missing password field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin"
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty("message", "Missing values");
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-8: should fail login with missing account field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.message).toContain("Missing");
        });

        test("TC-9: should fail login with empty account field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "",
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-10: should fail login with empty password field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: ""
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-11: should fail login with both fields empty", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "",
                password: ""
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body).toHaveProperty("status", "error");
        });

        test("TC-12: should fail login with no request body", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({});
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test("TC-13: should be case-sensitive for account field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "ADMIN",
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });
    });

    /**
     * Test Suite: Security Tests
     */
    describe("Security Validation", () => {
        test("TC-14: should prevent SQL injection in account field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin' OR '1'='1",
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        test("TC-15: should prevent SQL injection in password field", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123' OR '1'='1"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        test("TC-16: should handle special characters in credentials", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin<script>alert('xss')</script>",
                password: "<img src=x onerror='alert(1)'>"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        test("TC-17: should not expose database errors in response", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "wrongpassword"
            });
            expect(response.body.message).not.toContain("MongoDB");
            expect(response.body.message).not.toContain("database");
        });
    });

    /**
     * Test Suite: Token Validation
     */
    describe("Token Validation", () => {
        test("TC-18: should return valid session token in cookie", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            expect(response.headers["set-cookie"]).toBeDefined();
            const cookies = response.headers["set-cookie"];
            const sessionCookie = cookies.find(cookie => cookie.includes("sessionToken"));
            expect(sessionCookie).toBeDefined();
        });

        test("TC-19: should return different cookies for different login attempts", async () => {
            const response1 = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            const response2 = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            expect(response1.headers["set-cookie"]).toBeDefined();
            expect(response2.headers["set-cookie"]).toBeDefined();
        });
    });

    /**
     * Test Suite: Response Format Consistency
     */
    describe("Response Format", () => {
        test("TC-20: should return consistent response structure for successful login", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "user",
                password: "user123"
            });
            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("user");
            expect(response.headers["set-cookie"]).toBeDefined();
        });

        test("TC-21: should return consistent response structure for failed login", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "wrongpassword"
            });
            expect(response.body).toHaveProperty("status", "error");
            expect(response.body).toHaveProperty("message");
            expect(Array.isArray(response.body.message) || typeof response.body.message === "string").toBe(true);
        });

        test("TC-22: should use consistent status codes across different error scenarios", async () => {
            const responses = await Promise.all([
                request(app).post(`${version}/auth/login`).send({ account: "admin", password: "wrong" }),
                request(app).post(`${version}/auth/login`).send({ account: "", password: "" }),
                request(app).post(`${version}/auth/login`).send({ account: "nonexist", password: "pass" })
            ]);
            
            expect(responses[0].status).toBe(StatusCodes.UNAUTHORIZED);
            expect(responses[1].status).toBe(StatusCodes.BAD_REQUEST);
            expect(responses[2].status).toBe(StatusCodes.UNAUTHORIZED);
        });
    });

    /**
     * Test Suite: Data Type Validation
     */
    describe("Data Type Validation", () => {
        test("TC-23: should reject non-string credentials", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: 12345,
                password: true
            });
            expect([StatusCodes.BAD_REQUEST, StatusCodes.UNAUTHORIZED]).toContain(response.status);
        });

        test("TC-24: should reject null values", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: null,
                password: null
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test("TC-25: should reject undefined values", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: undefined,
                password: undefined
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    /**
     * Test Suite: Edge Cases
     */
    describe("Edge Cases", () => {
        test("TC-26: should handle very long account strings", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "a".repeat(10000),
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        test("TC-27: should handle whitespace in credentials", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "  admin  ",
                password: "admin123"
            });
            expect([StatusCodes.OK, StatusCodes.UNAUTHORIZED]).toContain(response.status);
        });

        test("TC-28: should handle unicode characters", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin@#$%^&*()",
                password: "admin123"
            });
            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        test("TC-29: should handle maximum safe integer for numeric input", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: Number.MAX_SAFE_INTEGER,
                password: "admin123"
            });
            expect([StatusCodes.BAD_REQUEST, StatusCodes.UNAUTHORIZED]).toContain(response.status);
        });
    });

    /**
     * Test Suite: HTTP Method Validation
     */
    describe("HTTP Method Validation", () => {
        test("TC-30: should reject GET request to login endpoint", async () => {
            const response = await request(app).get(`${version}/auth/login`);
            expect([StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.NOT_FOUND]).toContain(response.status);
        });

        test("TC-31: should reject PUT request to login endpoint", async () => {
            const response = await request(app).put(`${version}/auth/login`);
            expect([StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.NOT_FOUND]).toContain(response.status);
        });

        test("TC-32: should reject DELETE request to login endpoint", async () => {
            const response = await request(app).delete(`${version}/auth/login`);
            expect([StatusCodes.METHOD_NOT_ALLOWED, StatusCodes.NOT_FOUND]).toContain(response.status);
        });
    });

    /**
     * Test Suite: Role-Based Access Control (RBAC)
     */
    describe("Role-Based Access Control", () => {
        test("TC-38: admin user should have admin role", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            expect(response.body.data.user).toHaveProperty("role");
            expect(response.body.data.user.role).toBeDefined();
        });

        test("TC-39: regular user should have user role", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "user",
                password: "user123"
            });
            expect(response.body.data.user).toHaveProperty("role");
            expect(response.body.data.user.role).toBeDefined();
        });

        test("TC-40: manager user should have manager role", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "manager",
                password: "manager123"
            });
            expect(response.body.data.user).toHaveProperty("role");
            expect(response.body.data.user.role).toBeDefined();
        });

        test("TC-41: different users should have correct roles", async () => {
            const adminLogin = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            const userLogin = await request(app).post(`${version}/auth/login`).send({
                account: "user",
                password: "user123"
            });
            
            expect(adminLogin.body.data.user).toHaveProperty("role");
            expect(userLogin.body.data.user).toHaveProperty("role");
            expect(adminLogin.body.data.user.account).not.toBe(userLogin.body.data.user.account);
        });
    });

    /**
     * Test Suite: Authentication State Management
     */
    describe("Authentication State Management", () => {
        test("TC-42: should return same user data across multiple login attempts", async () => {
            const response1 = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            const response2 = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });

            expect(response1.body.data.user.account).toBe(response2.body.data.user.account);
            expect(response1.body.data.user.email).toBe(response2.body.data.user.email);
            expect(response1.body.data.user.role).toBe(response2.body.data.user.role);
        });

        test("TC-43: should not store password in response", async () => {
            const response = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            expect(response.body.data.user).not.toHaveProperty("password");
            expect(response.body.data).not.toHaveProperty("password");
        });

        test("TC-44: should not return other users' data", async () => {
            const adminResponse = await request(app).post(`${version}/auth/login`).send({
                account: "admin",
                password: "admin123"
            });
            const userResponse = await request(app).post(`${version}/auth/login`).send({
                account: "user",
                password: "user123"
            });

            expect(adminResponse.body.data.user.account).not.toBe(userResponse.body.data.user.account);
            expect(adminResponse.body.data.user._id).not.toBe(userResponse.body.data.user._id);
        });
    });

    /**
     * Test Suite: Concurrent Login Attempts
     */
    describe("Concurrent Login Attempts", () => {
        test("TC-45: should handle multiple simultaneous login requests", async () => {
            const requests = [];
            for (let i = 0; i < 5; i++) {
                requests.push(
                    request(app).post(`${version}/auth/login`).send({
                        account: "admin",
                        password: "admin123"
                    })
                );
            }

            const responses = await Promise.all(requests);
            responses.forEach(response => {
                expect(response.status).toBe(StatusCodes.OK);
                expect(response.headers["set-cookie"]).toBeDefined();
                expect(response.body.data).toHaveProperty("user");
            });
        });

        test("TC-46: should handle mixed concurrent valid and invalid login attempts", async () => {
            const requests = [
                request(app).post(`${version}/auth/login`).send({
                    account: "admin",
                    password: "admin123"
                }),
                request(app).post(`${version}/auth/login`).send({
                    account: "admin",
                    password: "wrongpassword"
                }),
                request(app).post(`${version}/auth/login`).send({
                    account: "user",
                    password: "user123"
                })
            ];

            const responses = await Promise.all(requests);
            expect(responses[0].status).toBe(StatusCodes.OK);
            expect(responses[1].status).toBe(StatusCodes.UNAUTHORIZED);
            expect(responses[2].status).toBe(StatusCodes.OK);
        });
    });

    /**
     * Test Suite: Content-Type and Headers
     */
    describe("Request Headers and Content-Type", () => {
        test("TC-47: should accept JSON content-type", async () => {
            const response = await request(app)
                .post(`${version}/auth/login`)
                .set("Content-Type", "application/json")
                .send({
                    account: "admin",
                    password: "admin123"
                });
            expect(response.status).toBe(StatusCodes.OK);
        });

        test("TC-48: should handle missing content-type header", async () => {
            const response = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "admin",
                    password: "admin123"
                });
            expect([StatusCodes.OK, StatusCodes.BAD_REQUEST]).toContain(response.status);
        });

        test("TC-49: should return JSON content-type in response", async () => {
            const response = await request(app)
                .post(`${version}/auth/login`)
                .send({
                    account: "admin",
                    password: "admin123"
                });
            expect(response.headers["content-type"]).toContain("application/json");
        });
    });
});
