class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.isOperational = true;
    this.statusCode = statusCode;
    this.success = false;
  }
}

module.exports = ApiError;
