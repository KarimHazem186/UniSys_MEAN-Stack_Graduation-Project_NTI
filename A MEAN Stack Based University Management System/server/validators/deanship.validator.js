// validators/deanship.validator.js

const validateRequest = require("../middlewares/validateRequest");
const validator = require("../utils/ExpressValidator");

exports.deanshipValidator = [
  validator.body("dean").validObjectId(),
  validator
    .body("staff")
    .optional()
    .isArray()
    .withMessage("Staff must be an array"),
  validator.body("staff.*").validObjectId(), // Validate each staff member
  validator.body("college").validObjectId(),
  validator.body("description").optional().cleanDesc(),
  validator
    .body("startDate")
    .notEmpty()
    .withMessage("startDate is required")
    .isISO8601()
    .withMessage("startDate must be a valid date"),
  validator
    .body("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid date"),

  validator.body("endDate").custom((endDate, { req }) => {
    if (
      req.body.startDate &&
      new Date(endDate) < new Date(req.body.startDate)
    ) {
      throw new Error("endDate must be after startDate");
    }
    return true;
  }),

  validateRequest,
];

exports.updateDeanshipValidator = [
  validator.body("dean").optional().validObjectId(),
  validator
    .body("staff")
    .optional()
    .isArray()
    .withMessage("Staff must be an array"),
  validator.body("staff.*").validObjectId(),
  validator.body("college").optional().validObjectId(),
  validator.body("description").optional().cleanDesc(),
  validator
    .body("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid date"),
  validator
    .body("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid date"),

  validator.body("endDate").custom((endDate, { req }) => {
    if (
      req.body.startDate &&
      new Date(endDate) < new Date(req.body.startDate)
    ) {
      throw new Error("endDate must be after startDate");
    }
    return true;
  }),
  validateRequest,
];
