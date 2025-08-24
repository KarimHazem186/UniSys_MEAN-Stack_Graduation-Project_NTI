const validateRequest = require("../middlewares/validateRequest");
// const ExpressValidator = require("../utils/ExpressValidator");
const validator = require("../utils/ExpressValidator");

exports.registerValidator = [
  validator.body('firstname').cleanName(),
  validator.body('lastname').cleanName(),
  validator.body('email').isEmailWithSanitize(),
  validator.body('password').isStrongPassword(),
  validator.body('phone').isPhone(),
  validator.body('role').allowedRole(),
  validateRequest,
];

exports.loginValidator=[
  validator.body('email').isEmailForLogin(),
  validator.body('password').isStrongPassword(),
  validateRequest
]

exports.updateValidator = [
  validator.body('firstname').optional().cleanName(),
  validator.body('lastname').optional().cleanName(),
  validator.body('role').optional().allowedRole(),
  validateRequest,
];


