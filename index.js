const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const app = express();

const port = 8010;

const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(":memory:");

const buildSchemas = require("./src/schemas");
const log = require("./logger/config/winston.config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Xendit Rides API",
      version: "1.0.0",
      description: "A simple documentation for  e-hailing(Rides API)",
    },
    servers: [
      {
        url: "http://localhost:8010",
      },
    ],
  },
  apis: ["./src/app.js"],
};

const specs = swaggerJSDoc(options);

db.serialize(() => {
  buildSchemas(db);

  const app = require("./src/app")(db);

  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

  app.listen(port, () => log.info(`App started and listening on port ${port}`));
});
