const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.couseValidator = [
  validator.body("code").courseCode(),
  validator.body("title").courseTitle(),
  validator.body("description").courseDescription(),
  validator.body("creditHours").creditHours(),
  validator.body("department").departmentId(),
  validator.body("prerequisites").prerequisites(),
  validator.body("isActive").isActive(),
  validateRequest,
];