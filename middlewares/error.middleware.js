const ApiError = require("../utils/ApiError");

const sendErrorForDev = (err, res) => {
  console.log("🚀 ~ sendErrorForDev ~ err:", err);
  res.status(err.statusCode).json({
    success: err.success || false,
    message: err.message || "Something went wrong",
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  if (err.statusCode?.toString()?.startsWith("5")) {
    res.status(err.statusCode).json({
      success: false,
      message: "Something went wrong",
    });
  } else {
    // For other status codes
    res.status(err.statusCode).json({
      success: err.success || false,
      message: err.message || "Something went wrong",
    });
  }
};

const handleInvalidJwtSignature = (_) =>
  new ApiError("Invalid token, Please login again ...", 401);

const handleJwtExpired = (_) =>
  new ApiError("Expired token, Please login again ...", 401);

const duplicationErrorFormater = error => {
  let name = error?.detail?.match(/\((.*?)\)/)[1];
  if(name.includes(", ")) {
    const splitted = name.split(", ");
    name = splitted[splitted.length - 1];
  }
  if (name.endsWith("_en")) name = "English " + name.slice(0, -3);
  else if (name.endsWith("_ar")) name = "Arabic " + name.slice(0, -3);
  else name = name.charAt(0).toUpperCase() + name.slice(1);
  if (name.includes("_")) {
    const splitted = name.split("_");
    name = splitted
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  name += " is already used";
  return name;
};

const globalError = (err, req, res, next) => {
  err.success = err.success || false;
  err.statusCode = err.statusCode || 500;
  if (err.code === "23505") {
    err.message = duplicationErrorFormater(err);
    err.statusCode = 409;
  } else if (err.name === "JsonWebTokenError")
    err = handleInvalidJwtSignature();
  else if (err.name === "TokenExpiredError") err = handleJwtExpired();
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
