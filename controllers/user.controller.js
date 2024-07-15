const asyncHandler = require("express-async-handler");

const pool = require("../config/pool.config");
const CodeGenerator = require("../utils/codeGenerator");

const ApiError = require("../utils/ApiError");
const EmailHandler = require("../utils/email.handler");
const JwtHandler = require("../utils/jwtHandler");
const Hasher = require("../utils/hasher");

const { USER, SUPER_ADMIN, ADMIN } = require("../utils/constants");

class UserController {
  // @desc    Get users data and filteration
  // @route   GET /user/:id
  // @access  Private (Super Admin & Admin)
  static getUsers = asyncHandler(async (req, res, next) => {
    const { search, verified, dateFrom, dateTo } = req.query;
    let { page, perPage } = req.query;
    // Query Obj
    let queryData = {
      paramsCount: 1,
      queryParams: [USER],
      queryText: `
      SELECT 
        id, name, email, is_verified, created_at
      FROM
        "user"
      WHERE
        role = $1
      `,
    };
    // Search
    if (search) {
      queryData.paramsCount++;
      queryData.queryParams.push(`%${search?.toString()}%`);
      queryData.queryText += ` AND ("name" ILIKE $${queryData.paramsCount} OR email ILIKE $${queryData.paramsCount})`;
    }
    // Filter by verified status
    if (verified) {
      queryData.queryParams.push(verified === "true" ? true : false);
      queryData.queryText += ` AND is_verified = $${++queryData.paramsCount}`;
    }
    // Filter by date range
    if (dateFrom) {
      const startOfDay = new Date(dateFrom);
      startOfDay.setHours(0, 0, 0, 0); // sets time to 00:00:00.000
      queryData.queryParams.push(startOfDay);
      queryData.queryText += ` AND created_at >= $${++queryData.paramsCount}`;
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999); // sets time to 23:59:59.999
      queryData.queryParams.push(endOfDay);
      queryData.queryText += ` AND created_at <= $${++queryData.paramsCount}`;
    }
    // Query to get total count of users
    const {
      rows: [{ total_users }],
    } = await pool.query(
      `
    SELECT COUNT(*) as total_users
    FROM "user"
    WHERE role = $1
  `,
      [USER]
    );
    // Count of verified users
    let {
      rows: [{ total_verified_users }],
    } = await pool.query(
      `
    SELECT COUNT(*) as total_verified_users
    FROM "user"
    WHERE role = $1 AND is_verified = true
  `,
      [USER]
    );
    // Counts from query results
    const totalUsers = parseInt(total_users, 10);
    const totalVerifiedUsers = parseInt(total_verified_users, 10);
    // Pagination
    let pagination;
    if (page || perPage) {
      page = parseInt(page) || 1;
      perPage = parseInt(perPage) || 10;
      const offset = (page - 1) * perPage;
      pagination = {
        totalResults: totalUsers,
        totalPages: Math.ceil(totalUsers / perPage),
        currentPage: page,
        perPage,
      };
      queryData.queryText += ` LIMIT $${++queryData.paramsCount} OFFSET $${++queryData.paramsCount}`;
      queryData.queryParams.push(perPage, offset);
    }
    // Execute the query
    const { rows: data } = await pool.query(
      queryData.queryText,
      queryData.queryParams
    );
    // Response
    res.status(200).json({
      success: true,
      pagination,
      results: data.length,
      totalUsers,
      totalVerifiedUsers,
      data,
    });
  });

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

  // @desc    Delete user by id
  // @route   DELETE /user/:id
  // @access  Private (Super Admin & Admin)
  static deleteUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    const { rowCount: deleted } = await pool.query(
      `
      DELETE FROM
        "user"
      WHERE
        id = $1 AND role = $2
      ;
      `,
      [userId, USER]
    );
    // Check user
    if (!deleted) return next(new ApiError("User not found", 404));
    // Response
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  });
}

module.exports = UserController;
