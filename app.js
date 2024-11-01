require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const config = require("./utils/config");
const blogRoutes = require("./controllers/blogs");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const devRouter = require("./controllers/developerUtil");
const {
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
} = require("./utils/middleware");

console.log("Application State:", process.env.NODE_ENV);

mongoose.set("strictQuery", false);
logger.info("Connecting to string", config.mongoUrl);

mongoose
  .connect(config.mongoUrl)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error(err);
  });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(tokenExtractor);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/dev", devRouter);
app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
