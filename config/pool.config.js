const Pool = require("pg").Pool;
require("dotenv").config();

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASS,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB,
  ssl: {
    rejectUnauthorized: false, // Disables SSL certificate verification
  },
});

module.exports = pool;
