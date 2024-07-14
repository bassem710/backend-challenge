const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const joiErrorHandler = require("./joiErrorHandler");

class AdminValidator {
  // Validate verify admin account fields
  static validateVerifyAdmin = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      code: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          "string.length": "Code must be exactly 6 digits long",
          "string.pattern.base": "Code must consist of digits only",
        }),
      password: Joi.string()
        .min(8)
        .max(255)
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters long",
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Confirm password must match new password",
        }),
    }).unknown();
    joiErrorHandler(schema, req);
    next();
  });
}

module.exports = AdminValidator;
