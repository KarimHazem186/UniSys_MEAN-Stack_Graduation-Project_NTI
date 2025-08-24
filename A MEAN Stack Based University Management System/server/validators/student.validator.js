const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.studentValidator = [
  validator.body("user").isMongoID(),
  validator.body("gender").isGender(),
  validator.body("dateOfBirth").isDateOfBirth(),
  validator.body("address.street").isOptionalString(),
  validator.body("address.city").isOptionalString(),
  validator.body("address.state").isOptionalString(),
  validator.body("address.zipCode").isOptionalString(),
  validator.body("address.country").isOptionalString(),
  validator.body("enrolledCourses").isCourseArray(),
  validator.body("department").isMongoID(),
  validator.body("program").isProgram(),
  validator.body("studentID").isStudentID(),
  validator.body("enrollmentDate").isValidEnrollmentDate(),
  validator.body("academicYear").isAcademicYear(),
  validator.body("gpa").isGPA(),
  validator.body("yearOfStudy").isYearOfStudy(),
  validateRequest
];
