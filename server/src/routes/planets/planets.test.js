const request = require("supertest");
const app = require("../../app");

describe("GET /v1/planets", () => {
  test("It should response with 200 status success", () => {
    request(app).get("/v1/planets")
    .expect("Content-Type", /json/)
    .expect(200)
  });
});