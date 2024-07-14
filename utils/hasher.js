const bcrypt = require("bcrypt");

class Hasher {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    return await bcrypt.hash(password?.toString(), salt);
  }

  static async hashPasswordMiddleware(req, res, next) {
    req.body.rawPassword = req.body.password;
    req.body.password = this.hashPassword(req.body.password);
    next();
  }

  static comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  static async generatePassword() {
    const password = Math.random().toString(36).slice(-8);
    return password;
  }
}

module.exports = Hasher;
