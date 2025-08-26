const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.adminUnitValidator = [
  validator.body("name").notEmpty().withMessage("Name is required").trim(),
  validator.body("description").notEmpty().withMessage("Description is required").cleanDesc(),

  validator
    .body("staff")
    .optional()
    .isArray()
    .withMessage("Staff must be an array"),
  validator.body("staff.*").validObjectId(),

  validator
    .body("college")
    .optional()
    .validObjectId()
    .custom((college, { req }) => {
      if (college && req.body.university) {
        throw new Error("Specify only one of college or university, not both");
      }
      return true;
    }),

  validator
    .body("university")
    .optional()
    .validObjectId()
    .custom((university, { req }) => {
      if (university && req.body.college) {
        throw new Error("Specify only one of college or university, not both");
      }
      return true;
    }),

  validateRequest,
];

exports.updateAdminUnitValidator = [
  validator.body("name").optional().notEmpty().withMessage("Name cannot be empty").trim(),
  validator.body("description").optional().notEmpty().withMessage("Description cannot be empty").cleanDesc(),

  validator
    .body("staff")
    .optional()
    .isArray()
    .withMessage("Staff must be an array"),
  validator.body("staff.*").validObjectId(),

  validator
    .body("college")
    .optional()
    .validObjectId()
    .custom((college, { req }) => {
      if (college && req.body.university) {
        throw new Error("Specify only one of college or university, not both");
      }
      return true;
    }),

  validator
    .body("university")
    .optional()
    .validObjectId()
    .custom((university, { req }) => {
      if (university && req.body.college) {
        throw new Error("Specify only one of college or university, not both");
      }
      return true;
    }),

  validateRequest,
];
