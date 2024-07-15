const router = require("express").Router();

// Constants
const { SUPER_ADMIN, ADMIN, USER } = require("../utils/constants.js");

// Controller Classes
const UserController = require("../controllers/user.controller.js");
const UserValidator = require("../validators/user.validator.js");

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

router.patch(
  "/updateMe",
  protect,
  allowedTo(USER),
  async (req, res, next) => {
    // Set user id in params to reuse existing controller (updateUser)
    req.params.id = req.user.id;
    next();
  },
  UserValidator.validateUpdateUser,
  UserController.updateUser
);

router.patch(
  "/:id",
  protect,
  allowedTo(SUPER_ADMIN, ADMIN),
  UserValidator.validateUpdateUser,
  UserController.updateUser
);

router.delete(
  "/:id",
  protect,
  allowedTo(SUPER_ADMIN, ADMIN),
  UserController.deleteUser
);

module.exports = router;
