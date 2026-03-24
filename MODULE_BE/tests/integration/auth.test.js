const request = require("supertest");
const app = require("../../src/app");
const { createUserWithRoleAdmin, createUserWithRoleUser, createUserWithRoleManager } = require("../fixtures/auth.fixtures");
const { version } = require("../../src/config").getConfig().api;
const { StatusCodes } = require("http-status-codes");
describe("Auth API Integration Tests", () => {
    beforeAll(async () => {
        await createUserWithRoleAdmin();
        await createUserWithRoleUser();
        await createUserWithRoleManager();
    });
    test("GET/auth/login - should login successfully with valid credentials", async () => {
        const response = await request(app).post(`${version}/auth/login`).send({
            account: "admin",
            password: "admin123"
        });
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty("message", "signin successfully");
        expect(response.body).toHaveProperty("status", "success");
        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user).toHaveProperty("account", "admin");
    });
    test("POST/auth/login - should fail login with invalid credentials", async () => {
        const response = await request(app).post(`${version}/auth/login`).send({
            account: "admin",
            password: "wrongpassword"
        });
        expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        expect(response.body).toHaveProperty("message", "Incorrect account or password");
        expect(response.body).toHaveProperty("status", "error");
    });
    test("POST/auth/login - should fail login with missing fields", async () => {
        const response = await request(app).post(`${version}/auth/login`).send({
            account: "admin"
        });
        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty("message", "Missing values");
        expect(response.body).toHaveProperty("status", "error");
    });
    test("POST/auth/login - should fail login with non-existing account", async () => {
        const response = await request(app).post(`${version}/auth/login`).send({
            account: "nonexisting",
            password: "password123"
        });
        expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        expect(response.body).toHaveProperty("message", "Incorrect account or password");
        expect(response.body).toHaveProperty("status", "error");
    });
    test("POST/auth/login - should fail login with empty fields", async () => {
        const response = await request(app).post(`${version}/auth/login`).send({
            account: "",
            password: ""
        });
        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body).toHaveProperty("message", "Missing values");
        expect(response.body).toHaveProperty("status", "error");
    });
});