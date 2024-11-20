const blogRoutes = require("express").Router();
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const { userExtractor } = require("../utils/middleware");

blogRoutes.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  res.json(blogs);
});

blogRoutes.get("/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate("user", {
    username: 1,
    name: 1,
  });
  res.json(blog);
});

blogRoutes.post("/", userExtractor, async (req, res) => {
  const body = req.body;
  const user = req.user;
  const blog = new Blog({
    title: body.title,
    author: body.author,
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

  const blogBefore = await Blog.findById(id);
  if (!blogBefore) {
    return res.status(404).json({ error: "No blog found" });
  }
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: blogBefore.likes + 1,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(id, blog, {
    new: true,
    runValidators: true,
    context: "query",
  });

  res.json(updatedBlog);
});

blogRoutes.post("/:id/comments", userExtractor, async (req, res) => {
  console.log(req.body);
  const { comment, user } = req.body;
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!comment || !user) {
    return res.status(400).json({ error: "Invalid Comment" });
  }
  const newComment = new Comment({
    comment,
    blog: blog._id,
    user,
  });
  await newComment.save();
  res.status(201).json(newComment);
});

blogRoutes.get("/:id/comments", userExtractor, async (req, res) => {
  const { id } = req.params;
  const comments = await Comment.find({ blog: id });
  res.json(comments);
});

module.exports = blogRoutes;
