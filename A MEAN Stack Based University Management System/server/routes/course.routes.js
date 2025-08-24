const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourseById,
  deleteCourseById,
  getCoursesByPrograms,
} = require("../controllers/course.controller");

const authorizeRole = require("../middlewares/authorizeRole");
const { authenticate } = require("../middlewares/authMiddleware");
const userRoles = require("../utils/role");
const { courseValidator } = require("../validators/course.validator");

router
  .route("/")
  .post(
    authenticate,
    authorizeRole([userRoles.ADMIN, userRoles.FACULTY]),
    courseValidator,
    createCourse
  )
  .get(getAllCourses);
router
  .route("/:id")
  .get(getCourseById)
  .put(
    authenticate,
    authorizeRole([userRoles.ADMIN, userRoles.FACULTY]),
    updateCourseById
  )
  .delete(
    authenticate,
    authorizeRole([userRoles.ADMIN, userRoles.FACULTY]),
    deleteCourseById
  );
// Get all courses for a specific program
router.route("/programs/:programId").get(getCoursesByPrograms);

module.exports = router;
