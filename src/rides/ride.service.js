const db = require("../../config/dbConfig");

exports.dbRunAsync = (sql) => new Promise((resolve, reject) => {
  db.run(sql, [], (err, row) => {
    if (err) {
      reject(err);
    }
    resolve(row);
  });
});

exports.dbAllAsync = (sql) => new Promise((resolve, reject) => {
  db.all(sql, [], (err, row) => {
    if (err) {
      reject(err);
    }
    resolve(row);
  });
});

// exports.prepareStmt = (queryString) => db.prepare(queryString);
