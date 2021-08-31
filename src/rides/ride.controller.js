const crudControllers = require("./ride.service");
const db = require("../../config/dbConfig");

module.exports = crudControllers(db);
