const User = require("../models/user");
const jwt = require("jsonwebtoken");

const errorHandler = (error, req, res, next) => {
  console.log("Error name: ", error.name);
  console.log("Error message: ", error.message);

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ error: "Malformatted Id" });
  }
  if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return res.status(400).json({ error: `expected 'username' to be unique` });
  }
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "token invalid" });
  }

  next(error);
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown endpoint" });
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.slice(7);
  } else {
    request.token = null;
  }

  next();
};

const userExtractor = async (req, res, next) => {
  const token = req.token;
  if (!token) {
    return res
      .status(404)
      .json({ error: "Token is required for this operation" });
  }
  const decodedToken = jwt.verify(token, process.env.JSON_SECRET);
  if (!decodedToken.id) {
    return res.status(404).json({ error: "Invalid token" });
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(400).json({ error: "Invalid user" });
  }
  req.user = user;
  next();
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
};
