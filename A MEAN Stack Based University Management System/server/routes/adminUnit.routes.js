// routes/adminUnit.routes.js
const express = require("express");
const router = express.Router();

const {
  createAdminUnit,
  getAllAdminUnits,
  getAdminUnitById,
  updateAdminUnit,
  deleteAdminUnit,
} = require("../controllers/adminUnit.controller");

const authorizeRole = require("../middlewares/authorizeRole");
const { authenticate } = require("../middlewares/authMiddleware");
const userRoles = require("../utils/role");

const { 
  adminUnitValidator, 
  updateAdminUnitValidator 
} = require("../validators/adminUnit.validator");

router
  .route("/")
  .get(getAllAdminUnits)
  .post(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    adminUnitValidator,
    createAdminUnit
  );

router
  .route("/:id")
  .get(getAdminUnitById)
  .put(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    updateAdminUnitValidator,
    updateAdminUnit
  )
  .delete(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    deleteAdminUnit
  );

module.exports = router;
