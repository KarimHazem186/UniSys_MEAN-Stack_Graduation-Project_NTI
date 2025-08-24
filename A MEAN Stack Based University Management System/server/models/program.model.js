// models/program.model.js
const mongoose = require("mongoose");

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Program name is required"],
        trim: true,
        minlength: [3, "Program name must be at least 3 characters"],
        maxlength: [100, "Program name must not exceed 100 characters"],
        unique: true,
        match: [/^[a-zA-Z0-9\s]+$/, "Program name can only contain letters, numbers, and spaces"],
    },
    code: {
      type: String,
      required: true,
      unique: true,
        uppercase: true,
        trim: true,
        minlength: [2, "Program code must be at least 2 characters"],
        maxlength: [10, "Program code must not exceed 10 characters"],
        match: [/^[A-Z0-9]+$/, "Program code can only contain uppercase letters and numbers"],

    },
    type: {
      type: String,
      enum: ["Diploma", "Bachelor", "Master", "PhD"],
      required: true,
        default: "Bachelor",
    },
    durationYears: {
      type: Number,
      default: 4,
        min: [1, "Duration must be at least 1 year"],
        max: [10, "Duration must not exceed 10 years"],
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,

    },
     courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",        
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Program", programSchema);
/*
{
  "name": "Bachelor of Computer Science",
  "code": "CS-BS",
  "type": "Bachelor",
  "durationYears": 4,
  "college": "64f7b19f5d8722341fcbbf93", // Example ObjectId of the college
  "department": "64f7b2a15d8722341fcbbf95" // Example ObjectId of the department (optional)
}

{
  "name": "Bachelor of Mechanical Engineering",
  "code": "ME-BSC",
  "type": "Bachelor",
  "durationYears": 5,
  "college": "64f7b19f5d8722341fcbbf93",
  "department": "64f9abc4aa2c3c621cfd3211"
}

*/