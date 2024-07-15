const asyncHandler = require("express-async-handler");

const pool = require("../config/pool.config");
const CodeGenerator = require("../utils/codeGenerator");

const ApiError = require("../utils/ApiError");
const EmailHandler = require("../utils/email.handler");
const JwtHandler = require("../utils/jwtHandler");
const Hasher = require("../utils/hasher");

const { USER, SUPER_ADMIN, ADMIN } = require("../utils/constants");

class UserController {
  // @desc    Get user data by id
  // @route   GET /user/:id
  // @access  Private (Super Admin & Admin)
  static getUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    const {
      rowCount: found,
      rows: [data],
    } = await pool.query(
      `
      SELECT 
        id, name, email, is_verified, created_at
      FROM
        "user"
      WHERE
        id = $1 AND role = $2
      ;
      `,
      [userId, USER]
    );
    // Check user
    if (!found) return next(new ApiError("User not found", 404));
    // Response
    res.status(200).json({
      success: true,
      data,
    });
  });
}

module.exports = UserController;
