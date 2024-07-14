const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class Hasher {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    return await bcrypt.hash(password?.toString(), salt);
  }

  static hashPasswordMiddleware = asyncHandler(async (req, res, next) => {
    req.body.rawPassword = req.body.password;
    req.body.password = await this.hashPassword(req.body.password);
    next();
  });

  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  static async generatePassword() {
    const password = Math.random().toString(36).slice(-8);
    return password;
  }

  static async hashCode(code) {
    return await crypto
      .createHash("sha256")
      .update(code?.toString())
      .digest("hex");
  }
}

module.exports = Hasher;
