const { test, describe, after, beforeEach } = require("node:test");
const assert = require("assert");
const User = require("../models/user");
const mongoose = require("mongoose");
const helper = require("./test_helper");
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  const passwordHash = await bcrypt.hash("password", 10);
  const user = new User({ username: "rootUser", name: "root", passwordHash });
  await user.save();
});

describe("Adding users to database follows proper validations", () => {
  test("Creating user with all fileds succeed", async () => {
    const usersAtBeginning = await helper.usersInDb();
    const newUser = {
      name: "Test User",
      username: "testUser",
      password: "helloworld",
    };
    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const usersAtEnd = await helper.usersInDb();

    assert.strictEqual(usersAtBeginning.length + 1, usersAtEnd.length);
  });

  test("Username and Password are required", async () => {
    const newUser = {
      username: "helloo",
      name: "Test User",
    };
    const res = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
    console.log("Error", res.body);
  });

  test("Username and password should be atleast 3 chars long", async () => {
    const newUser = {
      username: "himb",
      name: "Test User",
      password: "ok",
    };
    const res = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });
});
