const request = require("supertest");
const sqlite3 = require("sqlite3").verbose();
const assert = require("assert");
const { expect } = require("chai");

const db = new sqlite3.Database(":memory:");

const app = require("../src/app")(db);
const buildSchemas = require("../src/schemas");

describe("API tests", () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe("GET /health", () => {
    it("should return health", (done) => {
      request(app)
        .get("/health")
        .expect("Content-Type", /text/)
        .expect(200, done);
    });
  });
  describe("POST /rides, to create a new ride", () => {
    describe("POST /rides", () => {
      it("returns error when start or end latitude is not between -90 or 90", (done) => {
        request(app)
          .post("/rides")
          .send({
            start_lat: "3478.2",
            end_lat: "39.5",
            start_long: "178.9",
            end_long: "178.8",
            rider_name: "John Jane",
            driver_name: "John Doe",
            driver_vehicle: "Jeep Toyota",
          })
          .set("Accept", "application/json")
          .expect((res) => {
            res.body.error_code = "VALIDATION_ERROR";
            res.body.message = "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively";
          })
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("should return error when  start or end longitude values are not between -180 & 180", (done) => {
        request(app)
          .post("/rides")
          .send({
            start_lat: "-91",
            end_lat: "100",
            start_long: "-181",
            end_long: "180",
            rider_name: "John Jane",
            driver_name: "John Doe",
            driver_vehicle: "Toyota saloon car",
          })
          .set("Accept", "application/json")
          .expect((res) => {
            res.body.error_code = "VALIDATION_ERROR";
            res.body.message = "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively";
          })
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });

      it("should return numbers for latitude and longitude values", (done) => {
        request(app)
          .post("/rides")
          .send({
            start_lat: "-89",
            end_lat: "-88",
            start_long: "179",
            end_long: "101",
            rider_name: "John Jane",
            driver_name: "John Doe",
            driver_vehicle: "Jeep",
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .end((err, res) => {
            expect(res.body[0].rideID).to.be.a("number");
            expect(res.body[0].startLat).to.be.a("number");
            expect(res.body[0].startLong).to.be.a("number");
            expect(res.body[0].endLat).to.be.a("number");
            expect(res.body[0].endLong).to.be.a("number");
          });
        done();
      });

      it("should return string of values for rider's ad driver's data", (done) => {
        request(app)
          .post("/rides")
          .send({
            start_lat: "-89",
            end_lat: "-88",
            start_long: "179",
            end_long: "101",
            rider_name: "John Jane",
            driver_name: "John Doe",
            driver_vehicle: "Jeep",
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .end((err, res) => {
            expect(res.body[0].riderName).to.be.a("string");
            expect(res.body[0].driverName).to.be.a("string");
            expect(res.body[0].driverVehicle).to.be.a("string");
            expect(res.body[0].created).to.be.a("string");
          });
        done();
      });

      it("should return same values as that of the request data", (done) => {
        request(app)
          .post("/rides")
          .send({
            start_lat: "-89",
            end_lat: "-88",
            start_long: "179",
            end_long: "101",
            rider_name: "John Jane",
            driver_name: "John Doe",
            driver_vehicle: "Jeep",
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .end((err, res) => {
            expect(res.body[0].startLat).to.deep.equal(-89);
            expect(res.body[0].startLong).to.deep.equal(179);
            expect(res.body[0].endLat).to.deep.equal(-88);
            expect(res.body[0].endLong).to.deep.equal(101);
            expect(res.body[0].riderName).to.deep.equal("John Jane");
            expect(res.body[0].driverName).to.deep.equal("John Doe");
            expect(res.body[0].driverVehicle).to.deep.equal("Jeep");
          });
        done();
      });
      it("should return 1 for object length with a valid data", (done) => {
        request(app)
          .post("/rides")
          .send({
            start_lat: "-89",
            end_lat: "-88",
            start_long: "179",
            end_long: "101",
            rider_name: "John Jane",
            driver_name: "John Doe",
            driver_vehicle: "Jeep",
          })
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect((res) => {
            res.body.length = 1;
          })
          .end((err) => {
            if (err) return done(err);
            done();
          });
      });
    });
  });

  describe("GET /rides return all available rides with pagination", () => {
    it("responds with json", (done) => {
      request(app)
        .get("/rides")
        .expect("Content-Type", /json/)
        .expect(200, done);
    });
    it("return an array of object(s) and not undefined", (done) => {
      request(app)
        .get(`/rides/?page=${1}&limit=${10}`)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          expect(res.body).to.not.be.an("undefined");
        });
      done();
    });
    it("return an array of length greater than zero", (done) => {
      request(app)
        .get(`/rides/?page=${1}&limit=${10}`)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          // eslint-disable-next-line no-unused-expressions
          expect(res.body).to.not.empty;
        });
      done();
    });
    it("return an array of object(s)", (done) => {
      request(app)
        .get(`/rides/?page=${1}&limit=${10}`)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          expect(res.body).to.be.an("array");
        });
      done();
    });
    it("should return the value of 1 for the numbers of rows in the response object", (done) => {
      request(app)
        .get(`/rides?page=${1}&limit=${10}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
      done();
    });
    it("should return riderId of the first row that includes 1 for any page e.g 1, 11, 21, 31", (done) => {
      request(app)
        .get(`/rides?page=${1}&limit=${10}`)
        .expect(200)
        .then((res) => {
          expect(res.body[0].riderId).to.include("1");
        });
      done();
    });
    it("should return riderId of the first row that includes 1 for any page e.g 1, 11, 21, 31", (done) => {
      request(app)
        .get(`/rides?page=${1}&limit=${10}`)
        .expect(200)
        .then((res) => {
          expect(res.body[0].riderId).to.include("0");
        });
      done();
    });
    it("should return the value of 1 for the numbers of rows in the response object", (done) => {
      request(app)
        .get(`/rides?page=${1}&limit=${10}`)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
      done();
    });
    it("should return the value of 1 for the numbers of rows in the response object", (done) => {
      request(app)
        .get(`/rides/${100}`)
        .expect(200)
        .then((res) => {
          expect(res.body.error_code).toBe("RIDES_NOT_FOUND_ERROR");
          expect(es.body.message).toBe("Could not find any rides");
        });
      done();
    });
  });

  describe("GET /rides/:id, returns a specific ride with ID", () => {
    it("responds with json", (done) => {
      request(app)
        .get(`/rides/${1}`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200, done);
    });
    it("should return one item in array", (done) => {
      request(app)
        .get(`/rides/${1}`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
      done();
    });
    it("should return the value of 1 for the numbers of rows in the response object", (done) => {
      request(app)
        .get(`/rides/${100}`)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect((res) => {
          res.body.error_code = "RIDES_NOT_FOUND_ERROR";
          res.body.message = "Could not find any rides";
        })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
    it("should return error if a string is parsed as rideID", (done) => {
      request(app)
        .get("/rides/kkjll")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body.error_code).toBe("RIDES_NOT_FOUND_ERROR");
          expect(es.body.message).toBe("Could not find any rides");
        });
      done();
    });
  });
});
