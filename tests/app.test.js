const { expect } = require("chai");
const request = require("supertest");
const assert = require("assert");
const app = require("../src/app");

describe("GET /health", () => {
  it("should return health", async () => {
    const res = await request(app)
      .get("/health")
      .expect("Content-Type", /text/);
    assert.ok(res.statusCode === 200);
  });
  it("GET / should return 404", async () => {
    const res = await request(app)
      .get("/")
      .expect(404);
    assert.ok(res.statusCode === 404);
  });
});
