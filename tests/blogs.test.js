const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const testHelper = require("./test_helper");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
const { initialBlogs, notesInDb } = require("./test_helper");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { title } = require("node:process");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  console.log("DB Cleared");
  const noteObjs = initialBlogs.map((n) => new Blog(n));
  for (let obj of noteObjs) {
    await obj.save();
  }
});

test("Blogs are returned as JSON data and has the correct amount of data", async () => {
  const blogs = await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
  assert.strictEqual(blogs.body.length, initialBlogs.length);
});

test("Uniques identifier is returned as id", async () => {
  const blogs = (await api.get("/api/blogs")).body;
  blogs.forEach((blog) => {
    assert.ok(blog.id);
    assert.strictEqual(blog._id, undefined);
  });
});

test("Post request saves the data in db and the data integrity is maintained", async () => {
  const newUser = {
    username: "Test User",
    name: "Tester",
    password: "12345",
  };

  const [token, user] = await testHelper.generateToken(newUser);

  const noteToAdd = {
    title: "Hello World!",
    author: "Yaseen Sidhik",
    url: "www.testPost.com",
    likes: 500,
  };
  const resBlog = await api
    .post("/api/blogs")
    .send(noteToAdd)
    .set("Authorization", `Bearer ${token}`)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const addedBlog = resBlog.body;

  assert.strictEqual(addedBlog.title, noteToAdd.title);
  assert.strictEqual(addedBlog.author, user.username);
  assert.strictEqual(addedBlog.url, noteToAdd.url);
  assert.strictEqual(addedBlog.likes, noteToAdd.likes);

  const blogCount = await Blog.countDocuments();
  assert.strictEqual(blogCount, initialBlogs.length + 1);
});

test("If like property is missing it will be defaulted to 0", async () => {
  const newUser = {
    username: "Test User",
    name: "Tester",
    password: "12345",
  };

  const [token] = await testHelper.generateToken(newUser);
  const blogToAdd = {
    title: "Hello World!",
    author: "Yaseen Sidhik",
    url: "www.testPost.com",
  };

  let addedBlog = await api
    .post("/api/blogs")
    .send(blogToAdd)
    .set("Authorization", `Bearer ${token}`);
  addedBlog = addedBlog.body;
  assert.strictEqual(addedBlog.likes, 0);
});

test("If there is no title or url, server responds with bad request", async () => {
  const newUser = {
    username: "Test User",
    name: "Tester",
    password: "12345",
  };

  const [token] = await testHelper.generateToken(newUser);

  const blogToAdd = {
    author: "Yaseen Sidhik",
  };

  await api
    .post("/api/blogs")
    .send(blogToAdd)
    .set("Authorization", `Bearer ${token}`)
    .expect(400)
    .expect("Content-Type", /application\/json/);
});

test("Deleting a resource with id", async () => {
  const newUser = {
    username: "Test User",
    name: "Tester",
    password: "12345",
  };

  const [token] = await testHelper.generateToken(newUser);
  const blogToDelete = {
    title: "Hello World!",
    author: "Yaseen Sidhik",
    url: "www.testPost.com",
    likes: 500,
  };
  const resBlog = await api
    .post("/api/blogs")
    .send(blogToDelete)
    .set("Authorization", `Bearer ${token}`)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const addedBlog = resBlog.body;
  console.log(addedBlog);

  const delRes = await api
    .delete(`/api/blogs/${addedBlog.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = await notesInDb();
  const titles = blogsAtEnd.map((el) => el.title);
  assert(!titles.includes(blogToDelete.title));
});

test("Updating a resource with id", async () => {
  const blog = await testHelper.addaBlog();
  const blogToUpdate = {
    title: "Updated Hello World!",
    author: "Yaseen Sidhik Updated",
    url: "www.updatedTestPost.com",
    likes: 50,
  };
  const updatedResponse = await api
    .put(`/api/blogs/${blog.id}`)
    .send(blogToUpdate)
    .expect(200);

  const updatedBlog = updatedResponse.body;
  delete updatedBlog.user;
  assert.deepStrictEqual({ ...blogToUpdate, id: blog.id }, updatedBlog);
});

after(async () => {
  mongoose.connection.close();
});
