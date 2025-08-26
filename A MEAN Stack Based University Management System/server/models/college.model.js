const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
      minlength: [3, "College name must be at least 3 characters"],
      maxlength: [100, "College name must not exceed 100 characters"],
    },
    university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    default:"University"
  },
    description:{
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    code: {
      type: String,
      required: [true, "College code is required"],
      unique: true,
      uppercase: true,
      match: [/^[A-Z0-9]{2,10}$/, "College code must be 2-10 uppercase letters/numbers"],
    },
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // assuming deans are users
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      }
    ],
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    establishedYear: {
      type: Number,
      min: [1800, "Year must be after 1800"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=.]+)?$/,
        "Invalid website URL"
      ],
    }
  },
  {
    timestamps: true,
  }
);

const College = mongoose.model("College", collegeSchema);
module.exports = College;

/*
{
  "name": "College of Engineering",
  "code": "ENGR",
  "dean": "64f7b19f5d8722341fcbbf93",
  "departments": ["64f7bd315d8722341fcbbf95"],
  "address": {
    "street": "456 Tech Rd",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94107",
    "country": "USA"
  },
  "establishedYear": 1995,
  "website": "https://engineering.university.edu"
}

*/