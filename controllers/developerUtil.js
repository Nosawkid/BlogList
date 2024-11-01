const devRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

devRouter.delete("/", async (req, res) => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  res.status(200).send({ message: "Success" });
});

module.exports = devRouter;
