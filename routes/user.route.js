const router = require("express").Router();

// Constants
const { SUPER_ADMIN, ADMIN } = require("../utils/constants.js");

// Controller Classes
const UserController = require("../controllers/user.controller.js");

// Middlewares
const { protect } = require("../middlewares/authentication.middleware.js");
const { allowedTo } = require("../middlewares/authorization.middleware.js");

router.get(
  "/",
  protect,
  allowedTo(SUPER_ADMIN, ADMIN),
  UserController.getUsers
);

router.get(
  "/:id",
  protect,
  allowedTo(SUPER_ADMIN, ADMIN),
  UserController.getUser
);

router.delete(
  "/:id",
  protect,
  allowedTo(SUPER_ADMIN, ADMIN),
  UserController.deleteUser
);

module.exports = router;
