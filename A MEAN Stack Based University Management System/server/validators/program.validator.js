const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.programValidator = [
  validator.body("name").isProgramName(),
    validator.body("code").isProgramCode(),
    validator.body("type").isProgramType(),
    validator.body("durationYears").isDurationYears(),
    validator.body("college").isMongoID(),
    validator.body("department").isOptionalMongoID(),
    validateRequest
];
