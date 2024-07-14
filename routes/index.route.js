const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const express = require("express");
const compression = require("compression");

// Routes
const AuthRoutes = require("./auth.route");

// Error Handling imports
const ApiError = require("../utils/ApiError");
const globalError = require("../middlewares/error.middleware");

module.exports = (app) => {
  // Middlewares
  app.use(cors());
  app.options("*", cors());
  app.use(helmet());
  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "25kb" }));
  // Routes
  app.use("/api/v1/auth", AuthRoutes);
  // Not Found Route
  app.all("*", (req, res, next) => {
    next(new ApiError(`This Route (${req.originalUrl}) is not found`, 400));
  });
  // Global Error Handler
  app.use(globalError);
};
