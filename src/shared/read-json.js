const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

module.exports = {
  readJson
};

