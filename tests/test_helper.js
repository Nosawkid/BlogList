const Blog = require("../models/blog");
const User = require("../models/user");
const app = require("../app");
const supertest = require("supertest");

const api = supertest(app);

const generateToken = async ({ username, name, password }) => {
  const newUser = {
    username,
    name,
    password,
  };

  const res = await api.post("/api/users").send(newUser);
  const user = res.body;
  const login = await api
    .post("/api/login")
    .send({ username: user.username, password: newUser.password });

  const token = login.body.token;

  return [token, user];
};

const addaBlog = async () => {
  const updateTestUser = {
    username: "John",
    name: "okworld",
    password: "12345",
  };

  const [token] = await generateToken(updateTestUser);

  const blog = {
    title: "Hello World!",
    author: "Yaseen Sidhik",
    url: "www.testPost.com",
    likes: 500,
  };

  const res = await api
    .post("/api/blogs")
    .send(blog)
    .set("Authorization", `Bearer ${token}`);

  const createdBlog = res.body;
  return createdBlog;
};

const initialBlogs = [
  {
    title: "Test Blog 1",
    author: "Someone",
    url: "www.test.com",
    likes: 10,
  },
  {
    title: "Test Blog 2",
    author: "Anyone",
    url: "www.test2.com",
    likes: 100,
  },
  {
    title: "Test Blog 3",
    author: "Somebody",
    url: "www.test3.com",
    likes: 15,
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  return users;
};

const notesInDb = async () => {
  const blogs = await Blog.find({});
  return blogs;
};

module.exports = {
  initialBlogs,
  notesInDb,
  usersInDb,
  generateToken,
  addaBlog,
};
