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

  // @desc    Get Top 3 users with highest login frequency
  // @route   GET /user/top3
  // @access  Private (Super Admin & Admin)
  static getTopUsersLoginFrequency = asyncHandler(async (req, res, next) => {
    const query = `
      SELECT 
        ul.user_id AS id,
        u.id,
        u.name,
        u.email,
        CAST(COUNT(*) AS INTEGER) AS count 
      FROM
        login_logs ul
      LEFT JOIN
        "user" u ON u.id = ul.user_id
      GROUP BY
        ul.user_id,
        u.id,
        u.name,
        u.email
      ORDER BY
        count DESC
      LIMIT 3;
    `;
    const { rows: topUsers } = await pool.query(query);
    // Response
    res.status(200).json({
      success: true,
      data: topUsers,
    });
  });

  // @desc    Get inactive users within the last hour
  // @route   GET /user/inactive
  // @access  Private (Super Admin & Admin)
  static getInactiveUsers = asyncHandler(async (req, res, next) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // Query to get users who have logged in within the last hour
    const activeUsersQuery = `
      SELECT DISTINCT user_id
      FROM login_logs
      WHERE date > $1;
    `;
    const { rows: activeUsersRows } = await pool.query(activeUsersQuery, [
      oneHourAgo,
    ]);
    const activeUserIds = activeUsersRows.map((row) => row.user_id);
    // If no users have logged in within the last hour, return all users
    if (activeUserIds.length === 0) {
      const allUsersQuery = `
        SELECT id, name, email
        FROM "user"
        WHERE role = $1;
      `;
      const { rows: data } = await pool.query(allUsersQuery, [USER]);
      return res.status(200).json({
        success: true,
        data,
      });
    }
    // Query to get users who haven't logged in within the last hour
    const inactiveUsersQuery = `
      SELECT 
        id, name, email
      FROM 
        "user"
      WHERE
        role = $1 AND id NOT IN (${activeUserIds.join(", ")});
    `;
    const { rows: inactiveUsers } = await pool.query(inactiveUsersQuery, [
      USER,
    ]);
    // Response
    res.status(200).json({
      success: true,
      data: inactiveUsers,
    });
  });

  // @desc    Update user data by id
  // @route   PATCH /user/:id
  // @access  Private (All based on token role)
  static updateUser = asyncHandler(async (req, res, next) => {
    // User id could be sent in parmas if admin or set by user token in the previous middleware based on the logged in token
    const userId = req.params.id;
    const { name, email } = req.body;
    // Query to update user
    const updateQuery = `
      UPDATE "user"
      SET name = $1, email = $2
      WHERE id = $3 AND role = $4
      RETURNING id, name, email, is_verified, created_at;
    `;
    const {
      rowCount: updated,
      rows: [updatedUser],
    } = await pool.query(updateQuery, [name, email, userId, USER]);
    // Check user
    if (!updated) return next(new ApiError("User not found", 404));
    // Response
    res.status(200).json({
      success: true,
      data: updatedUser,
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
