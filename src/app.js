const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

module.exports = (db) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     Ride:
   *       type: object
   *       required:
   *         - start_lat
   *         - end_lat
   *         - start_long
   *         - end_long
   *         - rider_name
   *         - driver_name
   *         - driver_vehicle
   *       properties:
   *         start_lat:
   *           type: string
   *           description: The latitude coordinate at start of the trip
   *         end_lat:
   *           type: string
   *           description: The latitude coordinate at end of the trip
   *         start_long:
   *           type: string
   *           description: The longitude coordinate at start of the trip
   *         end_long:
   *           type: string
   *           description: The longitude coordinate at end of the trip
   *         rider_name:
   *           type: string
   *           description: The rider(customer) name
   *         driver_name:
   *           type: string
   *           description: The driver name
   *         driver_vehicle:
   *           type: string
   *           description: The driver vehicle details
   *       example:
   *         start_lat: 34.5
   *         end_lat: 35.4
   *         start_long: 78.9
   *         end_long: 78.6
   *         rider_name: John Doe
   *         driver_name:  Jane Doe
   *         driver_vehicle: Toyota Lexus 350 Black NY 45 YU
   */

  /**
   * @swagger
   * tags:
   *   name: Rides
   *   description: The e-hailing API(Ride API)
   */

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Returns api server health status
   *     tags: [Rides]
   *     responses:
   *       200:
   *         description: Checks if server is running
   *         content:
   *           application/json:
   *             schema:
   *               type: string
   */

  app.get("/health", (req, res) => res.send("Healthy"));

  /**
   * @swagger
   * /rides:
   *   post:
   *     summary: Create a new ride
   *     tags: [Rides]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Ride'
   *     responses:
   *       200:
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Ride'
   *       500:
   *         description: Some server error
   */
  app.post("/rides", jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (
      startLatitude < -90
      || startLatitude > 90
      || startLongitude < -180
      || startLongitude > 180
    ) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message:
          "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
      });
    }

    if (
      endLatitude < -90
      || endLatitude > 90
      || endLongitude < -180
      || endLongitude > 180
    ) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message:
          "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively",
      });
    }

    if (typeof riderName !== "string" || riderName.length < 1) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Rider name must be a non empty string",
      });
    }

    if (typeof driverName !== "string" || driverName.length < 1) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Rider name must be a non empty string",
      });
    }

    if (typeof driverVehicle !== "string" || driverVehicle.length < 1) {
      return res.send({
        error_code: "VALIDATION_ERROR",
        message: "Rider name must be a non empty string",
      });
    }

    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];

    const result = db.run(
      "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)",
      values,
      function (err) {
        if (err) {
          return res.send({
            error_code: "SERVER_ERROR",
            message: "Unknown error",
          });
        }

        db.all(
          "SELECT * FROM Rides WHERE rideID = ?",
          this.lastID,
          (err, rows) => {
            if (err) {
              return res.send({
                error_code: "SERVER_ERROR",
                message: "Unknown error",
              });
            }

            res.send(rows);
          },
        );
      },
    );
  });

  /**
   * @swagger
   * /rides?page={page}&limit={limit}:
   *   get:
   *     summary: Returns the list of all the rides
   *     tags: [Rides]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *          type: string
   *         required: true
   *         description: The page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *          type: string
   *         required: true
   *         description: The number of rows per page
   *     responses:
   *       200:
   *         description: The list of the rides
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Ride'
   *       404:
   *         error: RIDES_NOT_FOUND_ERROR
   *         description: Could not find any rides
   *       500:
   *         error: SERVER_ERROR
   *         description: Unknown error
   */
  app.get("/rides", (req, res) => {
    const { page } = req.query;
    const { limit } = req.query;
    const offset = (+page - 1) * limit;
    db.all(`SELECT * FROM Rides LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
      if (err) {
        return res.send({
          error_code: "SERVER_ERROR",
          message: "Unknown error",
        });
      }

      if (rows.length === 0) {
        return res.send({
          error_code: "RIDES_NOT_FOUND_ERROR",
          message: "Could not find any rides",
        });
      }

      res.send(rows);
    });
  });

  /**
   * @swagger
   * /rides/{id}:
   *   get:
   *     summary: Get the ride by id
   *     tags: [Rides]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The ride id
   *     responses:
   *       200:
   *         description: The ride description by id
   *         contents:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Ride'
   *       404:
   *         error: RIDES_NOT_FOUND_ERROR
   *         description: Could not find any rides
   *       500:
   *         error_code: SERVER_ERROR
   *         message: Unknown error
   */
  app.get("/rides/:id", (req, res) => {
    db.all(
      `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
      (err, rows) => {
        if (err) {
          return res.send({
            error_code: "SERVER_ERROR",
            message: "Unknown error",
          });
        }

        if (rows.length === 0) {
          return res.send({
            error_code: "RIDES_NOT_FOUND_ERROR",
            message: "Could not find any rides",
          });
        }

        res.send(rows);
      },
    );
  });

  return app;
};
