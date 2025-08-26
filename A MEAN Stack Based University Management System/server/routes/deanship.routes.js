// routes/deanship.routes.js
const express = require("express");
const router = express.Router();

const {
  createDeanship,
  getAllDeanships,
  getDeanshipById,
  updateDeanshipById,
  deleteDeanshipById,
} = require("../controllers/deanship.controller");

const authorizeRole = require("../middlewares/authorizeRole");
const { authenticate } = require("../middlewares/authMiddleware");
const userRoles = require("../utils/role");

const { deanshipValidator, updateDeanshipValidator } = require("../validators/deanship.validator");


router
  .route("/")
  .get(getAllDeanships)
  .post(
    authorizeRole([userRoles.ADMIN]),
    deanshipValidator,
    createDeanship
  );

router
  .route("/:id")
  .get(getDeanshipById)
  .put(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    updateDeanshipValidator,
    updateDeanshipById
  )
  .delete(authenticate, authorizeRole([userRoles.ADMIN]), deleteDeanshipById);

module.exports = router;
