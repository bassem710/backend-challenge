const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const joiErrorHandler = require("./joiErrorHandler");

class AdminValidator {
  // Validate register new user account fields
  static validateRegisterUserAccount = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(255).required().messages({
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

  // Validate update user account fields
  static validateUpdateUser = asyncHandler(async (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
    }).unknown();
    joiErrorHandler(schema, req);
    next();
  });
}

module.exports = AdminValidator;
