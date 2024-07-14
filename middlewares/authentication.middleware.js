const asyncHandler = require("express-async-handler");

const pool = require("../config/pool.config");
const JwtHandler = require("../utils/jwtHandler");
const ApiError = require("../utils/ApiError");

exports.protect = asyncHandler(async (req, res, next) => {
  // Get the token from the request header
  const token = req.header("Authorization");
  // Check if the token is missing, return 401 if missing
  if (!token) return next(new ApiError("Missing token!", 401));
  // Verify the token and extract the decoded user information
  const decoded = await JwtHandler.verifyToken(token);
  req.decoded = decoded;
  // Query the database to find the user based on ID
  const { rowCount: found, rows: user } = await pool.query(
    "SELECT * FROM user WHERE id = $1",
    [req.decoded.id]
  );
  // Check if user is not verified
  if (!user.password) // password is null at creating new user
    return next(new ApiError("Please verify your account", 403));
  // If no user found or token is not identical to user's token
  if (!user || !user.token !== token)
    return next(new ApiError("Invalid token", 401));
  // Set the user information, token & role in the request object
  req.token = token;
  req.user = user;
  req.role = user.role;
  next();
});