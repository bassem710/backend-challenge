const router = require("express").Router();

// Constants
const { SUPER_ADMIN, ADMIN } = require("../utils/constants.js");

// Controller Classes
const AdminAuthController = require("../controllers/adminAuth.controller");

// Middlewares
const { protect } = require("../middlewares/authentication.middleware");
const { allowedTo } = require("../middlewares/authorization.middleware.js");

router.post("/login", AdminAuthController.adminLogin);

module.exports = router;
