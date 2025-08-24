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


router.post("/",authenticate ,authorizeRole([userRoles.ADMIN]),collegeValidator,createCollege);
router.get("/", getAllColleges);
router.get("/:id", getCollegeById);
router.put("/:id",authenticate ,authorizeRole([userRoles.ADMIN]), updateCollege);
router.delete("/:id",authenticate ,authorizeRole("admin"), deleteCollege);

module.exports = router;
