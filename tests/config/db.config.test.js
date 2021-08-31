const sqlite3 = require("sqlite3").verbose();

// db = new sqlite3.Database(":memory:");
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite test database.");
});

module.exports = db;
