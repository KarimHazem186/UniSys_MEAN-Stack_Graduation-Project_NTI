const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    gender: {
      type: String,
      enum: {
        values: ["Male", "Female"],
        message: "Gender must be either 'Male' or 'Female'",
      },
      required: [true, "Gender is required"],
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of Birth is required"],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: "Invalid Date of Birth",
      },
    },

    address: {
      street: {
        type: String,
        trim: true,
        minlength: [3, "Street must be at least 3 characters"],
        maxlength: [100, "Street must not exceed 100 characters"],
      },
      city: {
        type: String,
        trim: true,
        minlength: [2, "City must be at least 2 characters"],
        maxlength: [50, "City must not exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        minlength: [2, "State must be at least 2 characters"],
        maxlength: [50, "State must not exceed 50 characters"],
      },
      zipCode: {
        type: String,
        trim: true,
        validate: {
          validator: function (value) {
            return /^[0-9]{4,10}$/.test(value);
          },
          message: "Zip code must be 4 to 10 digits",
        },
      },
      country: {
        type: String,
        trim: true,
        minlength: [2, "Country must be at least 2 characters"],
        maxlength: [50, "Country must not exceed 50 characters"],
      },
    },
    studentID: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      minlength: [3, "Student ID must be at least 3 characters"],
      maxlength: [20, "Student ID must not exceed 20 characters"],
      match: [/^[0-9]+$/, "Student ID must contain only numbers"],
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: "Invalid Enrollment Date",
      },
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Academic Info
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    program: {
      type: String,
      required: [true, "Program name is required"],
      trim: true,
      minlength: [2, "Program name must be at least 2 characters"],
      maxlength: [100, "Program name must not exceed 100 characters"],
    },
    yearOfStudy: {
      type: Number,
      default: 1,
      min: [1, "Year of study cannot be less than 1"],
      max: [8, "Year of study cannot be more than 8"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return /^\d{4}-\d{4}$/.test(value);
        },
        message: "Academic year must be in the format YYYY-YYYY",
      },
    },
    gpa: {
      type: Number,
      min: [0.0, "GPA cannot be less than 0.0"],
      max: [4.0, "GPA cannot be more than 4.0"],
    },
  },
  {
    timestamps: true,
  }
);

// Index on studentID & email for faster lookup
studentSchema.index({ studentID: 1, email: 1 });

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;


/*
{
  "user": "64f7b19f5d8722341fcbbf93",
  "gender": "Male",
  "dateOfBirth": "2002-05-18",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "studentID": "20250123",
  "enrollmentDate": "2025-08-20",
  "enrolledCourses": ["64f7bca15d8722341fcbbf94"],
  "department": "64f7bd315d8722341fcbbf95",
  "program": "BSc Computer Science",
  "yearOfStudy": 2,
  "academicYear": "2025/2026",
  "gpa": 3.6,
  "college": "64f8c1a15d8722341fcbbfa1"
}

*/