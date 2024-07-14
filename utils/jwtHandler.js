const jwt = require("jsonwebtoken");

class JwtHandler {
  static async generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET);
  }

  static async verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = JwtHandler;
