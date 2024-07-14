const router = require("express").Router();

// Constants
const { SUPER_ADMIN, ADMIN, USER } = require("../utils/constants.js");

// Controller Classes
const AuthController = require("../controllers/auth.controller.js");
const AuthValidator = require("../validators/admin.validator.js");
const Hasher = require("../utils/hasher.js");

// Middlewares
const { protect } = require("../middlewares/authentication.middleware.js");
const { allowedTo } = require("../middlewares/authorization.middleware.js");

router.post("/login", AuthController.login);

router.post(
  "/verify",
  AuthValidator.validateVerifyAccount,
  Hasher.hashPasswordMiddleware,
  AuthController.AccountVerification
);

router.delete(
  "/logout",
  protect,
  allowedTo(SUPER_ADMIN, ADMIN, USER),
  AuthController.logout
);

module.exports = router;
