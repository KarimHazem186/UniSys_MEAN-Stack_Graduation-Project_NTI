const express = require("express");
const {
  refreshToken,
  signup,
  verifyEmail,
  resendVerification,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controllers/user.controller");

const { authenticate } = require("../middlewares/authMiddleware");

const upload = require('../config/multer.config/multer.uploads'); // multer instance
const { uploadC } = require("../config/multer.config/cloudinary");
const { registerValidator, loginValidator } = require("../validators/auth.validator");
// const validateFileSize = require("../middlewares/validateFileSize");


const router = express.Router();

router.post("/refresh-token", refreshToken);
// router.post("/signup",upload.single('profileImg'),signup);
router.post("/signup",uploadC.single('profileImg'),registerValidator,signup);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

router.post("/login",loginValidator ,login); // Step 1: Email/password 

router.get("/profile", authenticate, getProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", authenticate, logout);

module.exports = router;
