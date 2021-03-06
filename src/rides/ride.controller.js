const { dbRunAsync, dbAllAsync, prepareStmt } = require("./ride.service");
const log = require("../../logger/config/winston.config");
const db = require("../../config/dbConfig");
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
const createOne = () => async (req, res) => {
  log.info(req.body);
  const values = [
    req.body.start_lat,
    req.body.start_long,
    req.body.end_lat,
    req.body.end_long,
    req.body.rider_name,
    req.body.driver_name,
    req.body.driver_vehicle,
  ];
  try {
    const stmt = db.prepare("INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(...values);
    stmt.finalize();
    try {
      const query = "SELECT * FROM Rides ORDER BY rowid DESC LIMIT 1;";
      const rows = await dbAllAsync(query);
      log.info(rows);
      res.send(rows);
    } catch (err) {
      log.error(err);
      res.send({
        error_code: "SERVER_ERROR",
        message: "Unknown error",
      });
    }
  } catch (err) {
    log.error(err);
    res.send({
      error_code: "SERVER_ERROR",
      message: "Unknown error",
    });
  }
};

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
const getRides = () => async (req, res) => {
  try {
    const { page } = req.query;
    const { limit } = req.query;
    const offset = (+page - 1) * limit;
    log.info(req.query);
    const query = `SELECT * FROM Rides LIMIT ${limit} OFFSET ${offset};`;
    rows = await dbAllAsync(query);
    log.info(rows);
    if (rows.length === 0) {
      return res.send({
        error_code: "RIDES_NOT_FOUND_ERROR",
        message: "Could not find any rides",
      });
    }
    log.info(rows);
    res.send(rows);
  } catch (err) {
    log.debug(err);
    res.send({
      error_code: "SERVER_ERROR",
      message: "Unknown error",
    });
  }
};

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
const getARideByID = () => async (req, res) => {
  try {
    const query = `SELECT * FROM Rides WHERE rideID='${req.params.id}';`;
    rows = await dbAllAsync(query);
    log.info(rows);
    if (rows.length === 0) {
      return res.send({
        error_code: "RIDES_NOT_FOUND_ERROR",
        message: "Could not find any rides",
      });
    }
    log.info(rows);
    res.send(rows);
  } catch (err) {
    log.debug(err);
    res.send({
      error_code: "SERVER_ERROR",
      message: "Unknown error",
    });
  }
};

module.exports = {
  createOne: createOne(),
  getRides: getRides(),
  getRide: getARideByID(),
};
