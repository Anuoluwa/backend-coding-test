const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const riderRouter = require("./rides/ride.router");

const app = express();
const port = process.env.PORT || 8010;

app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const log = require("../logger/config/winston.config");

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
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.get("/health", (req, res) => res.send("Healthy"));
app.use("/rides", riderRouter);

app.listen(port, () => log.info(`App started and listening on port ${port}`));

module.exports = app;
