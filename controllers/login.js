const loginRoute = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

loginRoute.post("/", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const passwordValidated =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordValidated)) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.JSON_SECRET, {
    expiresIn: 60 * 60 * 24,
  });
  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRoute;
