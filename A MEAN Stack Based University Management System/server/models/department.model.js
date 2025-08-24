const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      minlength: [3, "Department name must be at least 3 characters"],
      maxlength: [50, "Department name must not exceed 50 characters"],
      validate: {
        validator: function (value) {
          return /^[a-zA-Z\s]+$/.test(value);
        },
        message: "Department name can only contain letters and spaces",
      },
    },
    code :{
        type: String,
        required: [true, "Department code is required"],
        trim: true,
        unique: true,
        uppercase: true,
        minlength: [2, "Department code must be at least 2 characters"],
        maxlength: [10, "Department code must not exceed 10 characters"],
        match: [/^[A-Z0-9]+$/, "Department code can only contain uppercase letters and numbers"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],

    },
    college: {
      type: Schema.Types.ObjectId,
      ref: "College",
      required: [true, "College reference is required"],
    },
    headOfDepartment: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming heads are users
      required: [true, "Head of Department is required"],
      unique: true,
      validate: {
        validator: function (value) {
          return mongoose.Types.ObjectId.isValid(value);
        },
        message: "Invalid User ID for Head of Department",
      },
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
         validate: {
          validator: function (value) {
            return mongoose.Types.ObjectId.isValid(value);
          },
          message: "Invalid Course ID",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
