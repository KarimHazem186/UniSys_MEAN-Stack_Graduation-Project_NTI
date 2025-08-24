const {
  generateRefreshToken,
  generateAccessToken,
  generateResetToken,
} = require("../utils/jwt");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../utils/asyncWrapper");
const validateMongodb_ID = require("../utils/validateMongodb_ID");
const { sendEmail } = require("../utils/sendEmail");
const User = require("../models/user.model");
const { sendResponse } = require("../utils/response");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const refreshToken = asyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    throw appError.create("No refresh token", 401);
    //  return sendError(res, 401, "No refresh token");
  }
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw appError.create("User not found", 404);
  }
  if (user.refreshToken !== token) {
    throw appError.create("Refresh token does not match", 403);
  }
  const newAccessToken = generateAccessToken(user);
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60,
    secure: true,
    signed: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    accessToken: newAccessToken,
  });
  // return sendResponse(res, 200, "Access token refreshed successfully", null, newAccessToken);
});

const signup = asyncWrapper(async (req, res) => {
  console.log('Request body:', req.body);
  const { firstname, lastname, email, password, phone, role } = req.body;
  // const profileImg = req.file?.filename; // from multer
  // Check if file was uploaded
  let profileImg = null;
  if (req.file) {
    profileImg = {
      url: req.file.path,       // Cloudinary URL
      public_id: req.file.filename,  // Cloudinary public ID
    };
  }
 
  console.log(req.file);

  if (!firstname || !lastname || !email || !password || !phone) {
    throw appError.create("Please fill in all fields", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw appError.create("Email already exists", 400);
  }

  const newUser = await User.create({
    firstname,
    lastname,
    email,
    password,
    phone,
    role,
    profileImg,
  });

  const accessToken = generateAccessToken(newUser._id);
  const refreshToken = generateRefreshToken(newUser._id);

  newUser.refreshToken = refreshToken;
  await newUser.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${accessToken}`;

  const html = `<h3>Email Verification</h3>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>`;

  await sendEmail(email, "Verify Your Email", html);

  // const imageUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/uploads/images/${profileImg}`;

  const imageUrl = profileImg
  ? `${req.protocol}://${req.get("host")}/uploads/images/${profileImg}`
  : null;


  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "User Created Successfully",
    accessToken,
    // imageUrl,
    user: {
      id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
      profileImg: profileImg ? profileImg.url : null, 
    },
  });

  // return sendResponse(res, 201, "User Created Successfully", {
  //   user: {
  //     id: newUser._id,
  //     firstname: newUser.firstname,
  //     lastname: newUser.lastname,
  //     email: newUser.email,
  //     profileImg: imageUrl,
  //   },
  // });
});

const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log("Verify decode", decoded);
  const user = await User.findById(decoded.userId);

  if (!user) throw appError.create("User not found", 404);

  if (user.isVerified) throw appError.create("Email already verified", 400);

  user.isVerified = true;
  await user.save();

  if (!user.isVerified) {
    throw appError.create("Please verify your email first", 403);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Email verified successfully!",
  });
  // return sendResponse(res, 200, "Email verified successfully!");
});

const resendVerification = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) throw appError.create("User not found", 404);

  if (user.isVerified) throw appError.create("Email already verified", 400);

  const accessToken = generateAccessToken(user);

  // const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${accessToken}`;
  const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${accessToken}`;
  const html = `<h3>Resend Email Verification</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">${verificationLink}</a>`;

  await sendEmail(email, "Resend Email Verification", html);

  // res.status(200).json({ message: "Verification email resent successfully!" });
  return sendResponse(res, 200, "Verification email resent successfully!");
});

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw appError.create("Fields are required", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw appError.create("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw appError.create("Invalid credentials", 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "User Login Successfully",
    accessToken,
    user: {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    profileImg: user.profileImg?.url,
    },
  });
//   return sendResponse(res, 200, "User Login Successfully", {
//   user: {
//     id: user._id,
//     firstname: user.firstname,
//     lastname: user.lastname,
//     email: user.email,
//   },
// }, accessToken);
});

const getProfile = asyncWrapper(async (req, res) => {
  const id = req.user.userId;
  validateMongodb_ID(id);

  const user = await User.findById(id);
  if (!user) throw appError.create("User not found", 404);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Your profile info:",
    user: {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      profileImg: user.profileImg?.url,
    },
  });

//   return sendResponse(res, 200, "Your profile info:", {
//   user: {
//     firstname: user.firstname,
//     lastname: user.lastname,
//     email: user.email,
//     profileImg: user.profileImg,
//   }
// });
});

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw appError.create("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Do Not reveal that email doesn't exist
    return res
      .status(200)
      .json({ message: "Reset link sent (If email exists)" });
  }

  const resetToken = generateResetToken(user._id);
  const resetLink = `http://localhost:4200/reset-password/${resetToken}`;

  const subject = "Reset your password";
  const html = `
            <p>Hello,</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 10 minutes.</p>
            `;

  await sendEmail(user.email, subject, html);

  res.status(200).json({ message: "Reset link sent (if email exists)" });
  //  return sendResponse(res, 200, message);
});

const resetPassword = asyncWrapper(async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is missing" });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await user.save();

  res.status(200).json({ message: "Password has been updated successfully" });
});

const logout = asyncWrapper(async (req, res) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw appError.create("No refresh token found", 400);
  }

  // Find user this refresh token
  const user = await User.findOne({ refreshToken });
  console.log(user);
  if (!user) {
    // Even if token not found, clear cookie anyway

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return res.status(200).json({ message: "sign out successfully" });
  }

  // Remove refresh Token from DB
  user.refreshToken = null;
  await user.save();

  // Clear cookie in browser
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "sign out successfully" });
});

module.exports = {
  refreshToken,
  signup,
  verifyEmail,
  resendVerification,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  logout,
};
