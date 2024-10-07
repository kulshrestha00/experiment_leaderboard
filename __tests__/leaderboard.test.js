const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
require("dotenv").config();

beforeAll(async () => {
  // Connect to the database before tests
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Close the database connection after tests
  await mongoose.connection.close();
});

describe("Leaderboard API", () => {
  let token;

  beforeEach(async () => {
    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzaGl2YW0wMDYiLCJpYXQiOjE3MjgyNTk0OTcsImV4cCI6MTcyODI2MzA5N30.MRamLA9S0oy4eTlaaYoUUng_XcM8rVDH7nMsmbNfkDI"; // Use a valid token for the user you expect to test
  });

  test("GET /api/scores/leaderboard should return a 200 status and an array", async () => {
    const response = await request(app)
      .get("/api/scores/leaderboard")
      .send({ userId: "shivam006" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200); // Check for successful response
    expect(Array.isArray(response.body)).toBe(true); // Check if response is an array
  });

  test("GET /api/scores/leaderboard should return 403 for unauthorized access", async () => {
    const response = await request(app).get("/api/scores/leaderboard");
    expect(response.statusCode).toBe(403); // Check for forbidden response
  });
});
