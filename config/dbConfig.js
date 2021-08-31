const sqlite3 = require("sqlite3").verbose();
const buildSchemas = require("./schemas");
const log = require("../logger/config/winston.config");
// db = new sqlite3.Database(":memory:");
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    log.error(err.message);
  }
  log.info("Connected to the in-memory SQlite database.");
});

db.serialize(() => buildSchemas(db));

module.exports = db;
