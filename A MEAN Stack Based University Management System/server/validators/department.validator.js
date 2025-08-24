const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.departmentValidator = [
    validator.body("name").cleanName(),
    validator.body("description").cleanDesc(),
    validator.body("code").departmentCode(),
    validator.body("college").validObjectId(),
    validator.body("headOfDepartment").validObjectId(),
    validator.body("courses").validObjectId(),
    validateRequest
]