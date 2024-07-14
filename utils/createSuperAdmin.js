const pool = require("../config/pool.config");
const { SUPER_ADMIN } = require("./constants");
const { hashPassword } = require("./hasher");

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@gmail.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "123";

// Create super admin if not specified
async function createSuperAdmin() {
  try {
    const checkIfExistsQuery = `SELECT EXISTS (SELECT 1 FROM "user" WHERE email = $1);`;
    const {
      rows: [{ exists }],
    } = await pool.query(checkIfExistsQuery, [SUPER_ADMIN_EMAIL]);
    if (!exists) {
      const createSuperAdminQuery = `INSERT INTO "user" (name, email, password, role) VALUES ($1, $2, $3, $4);`;
      const hashedPassword = await hashPassword(SUPER_ADMIN_PASSWORD);
      await pool.query(createSuperAdminQuery, [
        "Super Admin",
        SUPER_ADMIN_EMAIL,
        hashedPassword,
        SUPER_ADMIN,
      ]);
      console.log("Super admin created successfully".green);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = createSuperAdmin;
