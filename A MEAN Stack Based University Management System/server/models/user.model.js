const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const userRoles = require("../utils/role");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, "firstName is required"],
      trim: true,
      minlength: [3, "firstName must be at least 3 characters"],
      maxlength: [20, "firstName must not exceed 20 characters"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s]+$/.test(value);
        },
        message: "firstName can only contain letters and spaces",
      },
    },
    lastname: {
      type: String,
      required: [true, "lastName is required"],
      trim: true,
      minlength: [3, "lastName must be at least 3 characters"],
      maxlength: [20, "lastName must not exceed 20 characters"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s]+$/.test(value);
        },
        message: "lastName can only contain letters and spaces",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(value);
        },
        message: "Invalid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      trim: true,
      select: false,
      validate: {
        validator: function (value) {
          return /(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value);
        },
        message:
          "Password must contain at least one number and one special character",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      minlength: [10, "Phone number must be at least 10 numbers"],
      maxlength: [15, "Phone number must not exceed 15 numbers"],
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: [userRoles.STUDENT, userRoles.ADMIN,userRoles.PROFESSOR,userRoles.FACULTY],
      default: userRoles.STUDENT,
    },
    // profileImg: {
    //   type: String,
    // },
    profileImg: {
      url: String,
      public_id: String,
    },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpiry: Date,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

// Encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
