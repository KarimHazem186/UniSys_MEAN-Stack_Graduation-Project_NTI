const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.collegeValidator = [
    validator.body("name").cleanName(),
    validator.body("description").cleanDesc(),
    validator.body("code").collegeCode(),
    validator.body("dean").validObjectId(),
    validator.body("establishedYear").establishedYear(),
    validator.body("website").website(),
    validateRequest
]