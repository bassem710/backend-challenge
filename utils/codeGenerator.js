const pool = require("../config/pool.config");
const asyncHandler = require("express-async-handler");

// Function to generate a random code and check for duplicates in the database
const generateRandomCode = asyncHandler(async (tableName, columnName) => {
  // Generate a random six-digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  // Check if the generated code already exists in the database
  const {
    rows: [{ count }],
  } = await pool.query(
    `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${columnName} = $1;`,
    [code]
  );
  // If the count is greater than 0, the code already exists in the database
  if (parseInt(count) > 0) return null; // Return null to indicate a duplicate code
  // If the code is unique, return it
  return code;
});

// Exporting the codeGenerator function
exports.codeGenerator = asyncHandler(async (tableName, columnName) => {
  let code;
  // Generate a new code until a unique one is found
  do {
    code = await generateRandomCode(tableName, columnName);
  } while (!code);
  return code;
});
