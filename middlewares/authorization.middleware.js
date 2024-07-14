const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.role))
      return next(new ApiError("Not allowed to access this route", 403));
    next();
  });