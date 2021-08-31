const sqlite3 = require("sqlite3").verbose();
const buildSchemas = require("./schemas");

// db = new sqlite3.Database(":memory:");
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

db.serialize(() => buildSchemas(db));

module.exports = db;
