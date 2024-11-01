const userRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Endpoint to get All users
userRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    url: 1,
    likes: 1,
  });
  res.json(users);
});

// Registration endpoint
userRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  if (password.length < 3) {
    return res
      .status(400)
      .json({ error: "Password should be atleast 3 chars long" });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

module.exports = userRouter;
