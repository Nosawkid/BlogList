require("dotenv").config();

const port = process.env.PORT;
const mongoUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URI
    : process.env.MONGO_URI;

module.exports = {
  port,
  mongoUrl,
};
