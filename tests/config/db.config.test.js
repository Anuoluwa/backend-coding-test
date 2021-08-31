const sqlite3 = require("sqlite3").verbose();
const log = require("../../logger/config/winston.config");

const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    log.error(err.message);
  }
  log.info("Connected to the in-memory SQlite test database.");
});

module.exports = db;
