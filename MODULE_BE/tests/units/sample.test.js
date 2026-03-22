const app = require("../../src/app");
const request = require("supertest");
const {StatusCodes} = require("http-status-codes");
const { error } = require("../../src/utils/response");
const {version} = require("../../src/config").getConfig().api;
describe("Health Check", () => {
    test("should return API is healthy" , async()=> {
        const response = await request(app).get(`${version}/healthy`);
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty("message", "API is healthy");
        expect(response.body).toHaveProperty("status", "success");
    })
});
