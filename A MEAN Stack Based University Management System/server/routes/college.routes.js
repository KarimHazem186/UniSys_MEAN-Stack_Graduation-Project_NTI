const express = require("express");
const router = express.Router();
const {
  createCollege,
  getAllColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} = require("../controllers/college.controller");
const authorizeRole = require("../middlewares/authorizeRole");
const { authenticate } = require("../middlewares/authMiddleware");
const userRoles = require("../utils/role");
const { collegeValidator } = require("../validators/college.validator");


router.route("/")
    .post(authenticate ,authorizeRole([userRoles.ADMIN]),collegeValidator,createCollege)
    .get(getAllColleges);

router.route("/:id")
    .get(getCollegeById)
    .put(authenticate ,authorizeRole([userRoles.ADMIN]),collegeValidator,updateCollege)
    .delete(authenticate ,authorizeRole("admin"),deleteCollege);    

module.exports = router;
