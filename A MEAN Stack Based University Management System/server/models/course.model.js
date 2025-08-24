const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      unique: true,
      uppercase: true,
      minlength: [3, "Course code must be at least 3 characters"],
      maxlength: [10, "Course code must not exceed 10 characters"],
      match: [/^[A-Z0-9]+$/, "Course code can only contain uppercase letters and numbers"],
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [5, "Course title must be at least 5 characters"],
      maxlength: [100, "Course title must not exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    programs: [{ type: Schema.Types.ObjectId, ref: "Program" }],
    creditHours: {
      type: Number,
      required: [true, "Credit hours are required"],
      min: [1, "Credit hours must be at least 1"],
      max: [10, "Credit hours must not exceed 10"],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department reference is required"],
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;

/*
{
  "code": "CS101",
  "title": "Introduction to Computer Science",
  "description": "Basic concepts of computer science.",
  "creditHours": 3,
  "department": "64f7bd315d8722341fcbbf95",
  "prerequisites": ["64f7bca15d8722341fcbbf94"],
  "isActive": true
}

{
  "code": "CS102",
  "title": "Data Structures",
  "description": "Core data structures in computer science.",
  "creditHours": 3,
  "department": "64f7bd315d8722341fcbbf95",
  "prerequisites": ["64f7bcf15d8722341fcbbf94"],
  "isActive": true
}

{
  "code": "CS201",
  "title": "Algorithms",
  "description": "Introduction to algorithms.",
  "creditHours": 3,
  "department": "64f7bd315d8722341fcbbf95",
  "prerequisites": ["64f7bcf15d8722341fcbbf94"],
  "isActive": true
}
{
  "code": "CS301",
  "title": "Operating Systems",
  "description": "Fundamentals of operating systems.",
  "creditHours": 4,
  "department": "64f7bd315d8722341fcbbf95",
  "prerequisites": ["64f7bcf15d8722341fcbbf94", "64f7bca15d8722341fcbbf94"],
  "isActive": true
}
{
  "code": "CS401",
  "title": "Database Systems",
  "description": "Introduction to database design and SQL.",
  "creditHours": 3,
  "department": "64f7bd315d8722341fcbbf95",
  "prerequisites": ["64f7bcf15d8722341fcbbf94"],
  "isActive": true
}
{
  "code": "CS501",
  "title": "Computer Networks",
  "description": "Basics of computer networking.",
  "creditHours": 3,
  "department": "64f7bd315d8722341fcbbf95",
  "prerequisites": ["64f7bcf15d8722341fcbbf94"],
  "isActive": true
}


*/