const asyncHandler = require("express-async-handler");

const pool = require("../config/pool.config");
const CodeGenerator = require("../utils/codeGenerator");

const ApiError = require("../utils/ApiError");
const EmailHandler = require("../utils/email.handler");
const JwtHandler = require("../utils/jwtHandler");
const Hasher = require("../utils/hasher");

const { USER } = require("../utils/constants");

class AuthController {
  // @desc    login
  // @route   POST /auth/login
  // @access  Public
  static login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // Query to find user by email
    const loginQuery = `SELECT * FROM "user" WHERE email = $1;`;
    const {
      rowCount: userFound,
      rows: [user],
    } = await pool.query(loginQuery, [email]);
    // If user is not found
    if (!userFound) return next(new ApiError("Wrong email or password!", 401));
    // If user is found but not verified
    if (!user.password) {
      const { code, hashedCode } = await CodeGenerator.generateHashedCode(
        `"user"`,
        "verification_code"
      );
      // Send verification email and update verification token concurrently
      await Promise.all([
        user.role === USER
          ? EmailHandler.userAccountMail(code, email)
          : EmailHandler.adminAccountMail(code, email),
        pool.query(`UPDATE "user" SET verification_code = $1 WHERE id = $2;`, [
          hashedCode,
          user.id,
        ]),
      ]);
      return res.status(200).json({
        success: true,
        message:
          "Verification email sent to your email. Please check your inbox.",
      });
    }
    // Check if the provided password is correct
    const validPassword = await Hasher.comparePassword(password, user.password);
    if (!validPassword) {
      return next(new ApiError("Wrong email or password!", 401));
    }
    // Generate token and update user token
    const token = await JwtHandler.generateToken({
      id: user.id,
      role: user.role,
    });
    // Save token and log login event concurrently
    await Promise.all([
      pool.query(`UPDATE "user" SET token = $1 WHERE id = $2;`, [
        token,
        user.id,
      ]),
      pool.query("INSERT INTO login_logs (user_id) VALUES ($1);", [user.id]),
    ]);
    // Return success message with userData & token
    const userData = {
      name: user.name,
      email: user.email,
    };
    return res.status(200).json({
      success: true,
      message: `Logged in successfully as ${user.email}`,
      userData,
      role: user.role,
      token: token,
    });
  });

  // @desc    Account verification
  // @route   POST /auth/verify
  // @access  Public
  static AccountVerification = asyncHandler(async (req, res, next) => {
    const { code, password } = req.body;
    // Hash the provided code
    const hashedCode = await Hasher.hashCode(code);
    // Query to find user by verification code
    const verificationQuery = `SELECT * FROM "user" WHERE verification_code = $1;`;
    const {
      rowCount: userFound,
      rows: [user],
    } = await pool.query(verificationQuery, [hashedCode]);
    // If user is not found or not verified
    if (!userFound)
      return next(new ApiError("Invalid verification code!", 401));
    // Update user password & remove verification code
    await pool.query(
      `UPDATE "user" SET password = $1, verification_code = NULL WHERE id = $2;`,
      [password, user.id]
    );
    // Return success message
    return res.status(200).json({
      success: true,
      message: `Account verified successfully`,
    });
  });

  // @desc    logout
  // @route   DELETE /auth/logout
  // @access  Private (All)
  static logout = asyncHandler(async (req, res, next) => {
    // Remove user token
    await pool.query(`UPDATE "user" SET token = NULL WHERE id = $1;`, [
      req.user.id,
    ]);
    // Return success message
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}

module.exports = AuthController;
