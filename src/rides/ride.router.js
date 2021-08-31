const express = require("express");

const controllers = require("./ride.controller");

const router = express.Router();

router
  .route("/")
  .post(controllers.createOne)
  .get(controllers.getRides);

router
  .route("/:id")
  .get(controllers.getRide);

module.exports = router;
