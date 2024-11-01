const app = require("./app");
const Blog = require("./models/blog");
const logger = require("./utils/logger");
const config = require("./utils/config");

const PORT = config.port || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
