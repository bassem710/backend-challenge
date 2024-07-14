const express = require("express");
require("colors");
require("dotenv").config();

const createSuperAdmin = require("./utils/createSuperAdmin");

// App
const app = express();

// Index routes
require("./routes/index.route")(app);

// PORT
const PORT = process.env.PORT || 8000;

// Server
app.listen(PORT, () => {
  createSuperAdmin(); // this function creates the super admin if not found
  console.log(`Server running on port ${PORT}`.blue);
});
