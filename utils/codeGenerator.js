const asyncHandler = require("express-async-handler");
const pool = require("../config/pool.config");
const { hashCode } = require("./hasher");

// Function to generate a random code and check for duplicates in the database
exports.generateHashedCode = asyncHandler(async (tableName, columnName) => {
  let codeObj;
  do {
    // generate a random code and hashed code to save in database
    codeObj = await generateRandomHashedCode(tableName, columnName);
  } while (!codeObj);
  return codeObj;
});

const generateRandomHashedCode = asyncHandler(async (tableName, columnName) => {
  // Generate a random six-digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  // hash the code as passwords to save it the database
  const hashed = await hashCode(code);
  // Check if the generated code already exists in the database
  const { rowCount: found } = await pool.query(
    `SELECT 1 AS count FROM ${tableName} WHERE ${columnName} = $1`,
    [hashed]
  );
  // If the count is greater than 0, the code already exists in the database
  if (parseInt(found)) return null; // Return null to indicate a duplicate code
  // If the code is unique, return it
  return {
    code: code,
    hashedCode: hashed,
  };
});
