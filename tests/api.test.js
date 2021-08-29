const request = require("supertest");
const sqlite3 = require("sqlite3").verbose();

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
      it("should return error when start or end latitude is not between -90 or 90", (done) => {
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

      it("should responds with json with a valid data", (done) => {
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
            res.body.rideID = 1;
            res.body.startLat = 89;
            res.body.startLong = 179;
            res.body.endLat = -88;
            res.body.endLong = 101;
            res.body.riderName = "John Jane";
            res.body.driverName = "John Doe";
            res.body.driverVehicle = "Jeep";
          })
          .end((err) => {
            if (err) return done(err);
            done();
          });
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

  describe("GET /rides return all available rides", () => {
    it("responds with json", (done) => {
      request(app)
        .get("/rides")
        .expect("Content-Type", /json/)
        .expect(200, done);
    });
    it("should return the value of 1 for the numbers of rows in the response object", (done) => {
      request(app)
        .get(`/rides/${1}`)
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
