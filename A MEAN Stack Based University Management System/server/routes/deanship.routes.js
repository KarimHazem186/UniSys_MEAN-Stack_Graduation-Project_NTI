// routes/deanship.routes.js
const express = require("express");
const router = express.Router();
const {
  createDeanship,
  getAllDeanships,
  getDeanshipById,
} = require("../controllers/deanship.controller");

router.route("/")
  .get(getAllDeanships)
  .post(createDeanship); // You can add auth here

router.route("/:id")
  .get(getDeanshipById);

module.exports = router;
