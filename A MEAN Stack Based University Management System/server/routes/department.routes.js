const express = require("express");
const router = express.Router();

const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartmentById,
  deleteDepartmentById,
  getDepartments
} = require("../controllers/department.controller");

const authorizeRole = require("../middlewares/authorizeRole");
const { authenticate } = require("../middlewares/authMiddleware");
const userRoles = require("../utils/role");
const { departmentValidator } = require("../validators/department.validator");

// Routes
router
  .route("/")
  .post(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    departmentValidator,
    createDepartment
  )
  .get(getAllDepartments);

router
  .route("/:id")
  .get(getDepartmentById)
  .put(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    // departmentValidator,
    updateDepartmentById
  )
  .delete(
    authenticate,
    authorizeRole([userRoles.ADMIN]),
    deleteDepartmentById
  );

  
router.get('/departments/:collegeId', getDepartments);

module.exports = router;
