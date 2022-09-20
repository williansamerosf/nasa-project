const request = require("supertest");
const app = require("../../app");
const { mongoConnect } = require("../../services/mongo/mongo");

describe("Launch API", () => {

  beforeAll(async () => {
    await mongoConnect()
  })

  describe("GET /v1/launches", () => {
    test("It should response with 200 status success", async () => {
      await request(app).get("/v1/launches")
      .expect("Content-Type", /json/)
      .expect(200)
    });
  });
  
  describe("POST /v1/launches", () => {
    const completeLaunchData = {
      "mission": "ZTM155",
      "rocket": "ZTM Experimental IS1",
      "target": "Kepler-62 f",
      "launchDate": "January 17, 2030"
    }
  
    const launchDataWithoutDate = {
      "mission": "ZTM155",
      "rocket": "ZTM Experimental IS1",
      "target": "Kepler-62 f"
    }
  
    const launchDataWithInvalidDate = {
      "mission": "ZTM155",
      "rocket": "ZTM Experimental IS1",
      "target": "Kepler-62 f",
      "launchDate": "anything"
    }
  
    test("It should response with 201 status success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201)
  
      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
  
      expect(responseDate).toBe(requestDate)
      expect(response.body).toMatchObject(launchDataWithoutDate)
    });
  
    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400)
  
      expect(response.body).toStrictEqual({
        error: "Missing required launch property"
      })
    });
  
    test("It should catch invalid dates", async () => {
      const response = await request(app)
      .post("/v1/launches")
      .send(launchDataWithInvalidDate)
      .expect("Content-Type", /json/)
      .expect(400)
  
      expect(response.body).toStrictEqual({
        error: "Invalid launch date"
      })
    });
  })
  
})