const express = require("express");

const controllers = require("./ride.controller");
const middleware = require("./ride.middleware");

const router = express.Router();

router
  .route("/")
  .post(middleware.validateData, controllers.createOne)
  .get(controllers.getRides);

router
  .route("/:id")
  .get(controllers.getRide);

module.exports = router;
