const router = require("express").Router();

// Constants
const { SUPER_ADMIN, ADMIN } = require("../utils/constants.js");

// Controller Classes
const AdminAuthController = require("../controllers/adminAuth.controller");
const AdminValidator = require("../validators/admin.validator.js");
const Hasher = require("../utils/hasher.js");

// Middlewares
const { protect } = require("../middlewares/authentication.middleware");
const { allowedTo } = require("../middlewares/authorization.middleware.js");

router.post("/login", AdminAuthController.adminLogin);

router.post(
  "/verify",
  AdminValidator.validateVerifyAdmin,
  Hasher.hashPasswordMiddleware,
  AdminAuthController.adminVerification
);

module.exports = router;
