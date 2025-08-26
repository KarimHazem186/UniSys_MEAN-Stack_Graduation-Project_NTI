const { body, param, query, validationResult } = require("express-validator");
const User = require("../models/user.model");
const appError = require("./appError");
const userRoles = require("./role");

const capitalizeFirst = (value) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Custom password validator
const hasSymbol = (value) => /[!@#$%^&*]/.test(value);

class ExpressValidator {
  body(field) {
    const chain = body(field);

    // 📧 Reusable: email validator with sanitize
    chain.isEmailWithSanitize = function () {
      return this.notEmpty()
        .escape()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .customSanitizer((value) => {
          if (typeof value !== "string") return value;
          return value.trim();
        })
        .normalizeEmail()
        .custom(async (value) => {
          const existingUser = await User.findOne({ email: value });
          if (existingUser) {
            // throw new Error('Email already in use');
            throw appError.create("Email already in use");
          }
          return true;
        });
    };

    // 📧 Reusable: email validator for login (no uniqueness check)
    chain.isEmailForLogin = function () {
      return this.notEmpty()
        .escape()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")
        .customSanitizer((value) => {
          if (typeof value !== "string") return value;
          return value.trim();
        })
        .normalizeEmail();
    };

    // 🔐 Reusable: strong password rule
    chain.isStrongPassword = function () {
      return (
        this.notEmpty()
          .escape()
          .withMessage("Password is required")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters")

          // .customSanitizer((value) => value.trim())

          .customSanitizer((value) => {
            if (typeof value !== "string") return value;
            return value.trim();
          })

          .matches(/(?=.*[0-9])(?=.*[!@#$%^&*])/)
          .withMessage("Password must contain a number and a special character")

          .custom((value) => {
            if (!hasSymbol(value)) {
              throw new Error(
                "Password must include at least one symbol (!@#$...)"
              );
            }
            return true;
          })
      );
    };

    // 🔤 Reusable: name cleaning rule
    chain.cleanName = function () {
      return this.notEmpty()
        .escape()
        .withMessage(`${field} is required`)
        .isLength({ min: 3, max: 100 })
        .withMessage(`${field} must be 3-100 characters`)

        .matches(/^[a-zA-Z\s]+$/)
        .withMessage(`${field} can only contain letters and spaces`)

        .trim()
        .customSanitizer((value) => {
          const clean = value.replace(/[^a-zA-Z\s]/g, "");
          return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
        });
      // .customSanitizer(capitalizeFirst)
    };

    chain.isPhone = function () {
      return this.notEmpty()
        .withMessage("Phone number is required")
        .trim()
        .matches(/^\+?[0-9]{10,15}$/) // Regex: optional '+' then 10-15 digits
        .withMessage(
          "Invalid phone number format. Must be 10-15 digits, optional '+' prefix"
        );
    };

    chain.cleanDesc = function () {
      return this.optional() // Description might be optional; remove if required
        .trim()
        .isLength({ max: 500 }) // max length 500 chars (adjust as needed)
        // .withMessage("Description must be at most 500 characters")
        .withMessage(`${field} must not exceed 500 characters`)
        .customSanitizer((value) => {
          if (typeof value !== "string") return value;
          // Remove script tags or potentially dangerous HTML tags (basic sanitization)
          return value
            .replace(/<script.*?>.*?<\/script>/gi, "") // Remove <script> tags
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove all HTML tags
            .replace(/\s+/g, " ") // Normalize spaces
            .trim();
        });
    };

    chain.allowedRole = function () {
      return this.optional()
        .customSanitizer((value) => value.trim().toLowerCase())
        .isIn([
          userRoles.STUDENT,
          userRoles.ADMIN,
          userRoles.FACULTY,
          userRoles.PROFESSOR,
        ])
        .withMessage("Invalid role");
    };

    // 🎓 Gender: "Male" or "Female"
    chain.isGender = function () {
      return this.notEmpty()
        .withMessage("Gender is required")
        .trim()
        .isIn(["Male", "Female"])
        .withMessage("Gender must be either 'Male' or 'Female'");
    };

    // 📅 Date of Birth: valid ISO date
    chain.isDateOfBirth = function () {
      return this.notEmpty()
        .withMessage("Date of birth is required")
        .isISO8601()
        .toDate()
        .withMessage("Invalid date format");
    };

    // 🏠 Address Subfields (can be used individually)
    chain.isOptionalString = function (min = 1, max = 100) {
      return this.optional()
        .trim()
        .isLength({ min, max })
        .withMessage(`Must be between ${min} and ${max} characters`);
    };

    // 🎓 Department ID (Mongo ID)
    chain.isMongoID = function () {
      return this.notEmpty()
        .withMessage("ID is required")
        .isMongoId()
        .withMessage("Invalid ID format");
    };

    // 📚 Program Name
    chain.isProgram = function () {
      return this.notEmpty()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Program must be between 2 and 100 characters");
    };

    // 🗓️ Academic Year: "YYYY-YYYY"
    chain.isAcademicYear = function () {
      return this.notEmpty()
        .withMessage("Academic year is required")
        .matches(/^\d{4}-\d{4}$/)
        .withMessage("Academic year must be in format YYYY-YYYY");
    };

    chain.isStudentID = function () {
      return this.notEmpty()
        .withMessage("Student ID is required")
        .isLength({ min: 3, max: 20 })
        .withMessage("Student ID must be 3-20 characters")
        .matches(/^[0-9]+$/)
        .withMessage("Student ID must contain only numbers")
        .trim();
    };

    chain.isValidEnrollmentDate = function () {
      return this.optional().custom((value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid Enrollment Date");
        }
        return true;
      });
    };

    // 📊 GPA: Between 0.0 and 4.0
    chain.isGPA = function () {
      return this.optional()
        .isFloat({ min: 0.0, max: 4.0 })
        .withMessage("GPA must be between 0.0 and 4.0");
    };

    // 🧑‍🎓 Year of Study: 1 - 8
    chain.isYearOfStudy = function () {
      return this.optional()
        .isInt({ min: 1, max: 8 })
        .withMessage("Year of study must be between 1 and 8");
    };

    // 📚 Enrolled Courses: array of Mongo IDs
    chain.isCourseArray = function () {
      return this.optional()
        .isArray()
        .withMessage("Must be an array of Course IDs")
        .bail()
        .custom((arr) => arr.every((id) => /^[a-f\d]{24}$/i.test(id)))
        .withMessage("All course IDs must be valid Mongo ObjectIds");
    };

    chain.collegeCode = function () {
      return this.notEmpty()
        .withMessage("College code is required")
        .trim()
        .isLength({ min: 2, max: 10 })
        .withMessage("College code must be 2-10 characters")
        .matches(/^[A-Z0-9]+$/)
        .withMessage(
          "College code must contain only uppercase letters and numbers"
        );
    };

    chain.website = function () {
      return this.optional().trim().isURL().withMessage("Invalid website URL");
    };

    chain.establishedYear = function () {
      return this.notEmpty()
        .withMessage("Established year is required")
        .isInt({ min: 1800, max: new Date().getFullYear() })
        .withMessage(
          `Year must be between 1800 and ${new Date().getFullYear()}`
        );
    };

    // chain.validObjectId = function () {
    //   return this.isMongoId().withMessage(`Invalid ${field} ID`);
    // };

     chain.validObjectId = function () {
      return this
        .notEmpty()
        .withMessage(`${field} is required`)
        .isMongoId()
        .withMessage(`${field} must be a valid MongoDB ObjectId`);
    };

    chain.courseCode = function () {
      return this.notEmpty()
        .withMessage("Course code is required")
        .isLength({ min: 3, max: 10 })
        .withMessage("Course code must be 3-10 characters")
        .matches(/^[A-Z0-9]+$/)
        .withMessage(
          "Course code can only contain uppercase letters and numbers"
        )
        .customSanitizer((code) => code.toUpperCase());
    };
    chain.departmentCode = function () {
      return this.notEmpty()
        .withMessage("Department code is required")
        .isLength({ min: 3, max: 10 })
        .withMessage("Department code must be 3-10 characters")
        .matches(/^[A-Z0-9]+$/)
        .withMessage(
          "Department code can only contain uppercase letters and numbers"
        )
        .customSanitizer((code) => code.toUpperCase());
    };

    chain.courseTitle = function () {
      return this.notEmpty()
        .withMessage("Course title is required")
        .isLength({ min: 5, max: 100 })
        .withMessage("Course title must be 5-100 characters")
        .trim();
    };

    chain.courseDescription = function () {
      return this.optional()
        .isLength({ max: 500 })
        .withMessage("Description must not exceed 500 characters")
        .trim();
    };

    chain.creditHours = function () {
      return this.notEmpty()
        .withMessage("Credit hours are required")
        .isInt({ min: 1, max: 10 })
        .withMessage("Credit hours must be between 1 and 10");
    };

    chain.departmentId = function () {
      return this.notEmpty()
        .withMessage("Department reference is required")
        .isMongoId()
        .withMessage("Invalid Department ID");
    };

    chain.prerequisites = function () {
      return this.optional()
        .isArray()
        .withMessage("Prerequisites must be an array")
        .custom((value) => value.every((id) => /^[a-f\d]{24}$/i.test(id)))
        .withMessage("Each prerequisite must be a valid course ID");
    };

    chain.isActive = function () {
      return this.optional()
        .isBoolean()
        .withMessage("isActive must be a boolean");
    };

    chain.isProgramName = function () {
      return this.notEmpty()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Program name must be between 2 and 100 characters");
    };

    chain.isProgramCode = function () {
      return this.notEmpty()
        .trim()
        .matches(/^[A-Z0-9]+$/i)
        .withMessage("Program code must be alphanumeric")
        .isLength({ min: 2, max: 10 })
        .withMessage("Program code must be between 2 and 10 characters");
    };

    chain.isProgramType = function () {
      return this.notEmpty()
        .trim()
        .isIn(["bachelor", "master", "phd"])
        .withMessage("Program type must be bachelor, master, or phd");
    };

    chain.isDurationYears = function () {
      return this.notEmpty()
        .withMessage("Duration years is required")
        .isInt({ min: 1, max: 10 })
        .withMessage("Duration years must be between 1 and 10");
    };

    chain.isOptionalMongoID = function () {
      return this.optional()
        .isMongoId()
        .withMessage("Invalid optional ID format");
    };

    chain.isID = function () {
      return this.isMongoId().withMessage(`Invalid ${field} ID`);
    };

    return chain;
  }

  param(field) {
    const chain = param(field);

    chain.isID = function () {
      return this.isMongoId().withMessage(`Invalid ${field} ID`);
    };

    return chain;
  }

  query(field) {
    const chain = query(field);

    chain.isID = function () {
      return this.isMongoId().withMessage(`Invalid ${field} ID`);
    };

    return chain;
  }

  validationResult(req) {
    return validationResult(req);
  }
}

module.exports = new ExpressValidator();
