const blogRoutes = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { userExtractor } = require("../utils/middleware");

blogRoutes.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  res.json(blogs);
});

blogRoutes.post("/", userExtractor, async (req, res) => {
  const body = req.body;
  const user = req.user;
  const blog = new Blog({
    title: body.title,
    author: user.username,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs.push(savedBlog._id);
  await user.save();
  res.status(201).json(savedBlog);
});

blogRoutes.delete("/:id", userExtractor, async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ error: "No blog found" });
  }
  if (blog.user.toString() !== user.id) {
    return res.status(403).json({ error: "Unauthorized operation" });
  }

  await Blog.findByIdAndDelete(id);
  res.status(204).end();
});

blogRoutes.put("/:id", async (req, res) => {
  const body = req.body;
  const { id } = req.params;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
    new: true,
    runValidators: true,
    context: "query",
  });

  res.json(updatedBlog);
});

module.exports = blogRoutes;
