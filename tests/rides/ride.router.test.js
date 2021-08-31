const { expect } = require("chai");
const request = require("supertest");
const assert = require("assert");
const app = require("../../src/app");

describe("Routes tests", () => {
  describe("POST /rides route ", () => {
    it("should return 200", async () => {
      const res = await request(app)
        .post("/ride")
        .expect("Content-Type", /text/);
    });
  });

  describe(" / GET rides route", () => {
    it("should return 200", async () => {
      const res = await request(app)
        .get("/health")
        .expect("Content-Type", /text/);
    });
  });

  describe("/GET ride/{id} route", () => {
    it("should return 200 for params", async () => {
      const res = await request(app)
        .get("/health")
        .query({ page: 1, limit: 10 })
        .expect("Content-Type", /text/);
    });
  });
});
