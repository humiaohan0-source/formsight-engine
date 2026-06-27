const path = require("path");
const fs = require("fs");
const { simulate } = require("./engine");

function main() {
  const seedPath = process.argv[2];
  if (!seedPath) {
    console.error("Usage: node src/simulate.js <seed.json>");
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(path.resolve(seedPath), "utf8"));
  const report = simulate(seed);
  console.log(JSON.stringify(report, null, 2));
}

main();
