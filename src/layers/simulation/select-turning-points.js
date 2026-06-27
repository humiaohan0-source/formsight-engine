const { matchPatterns } = require("../life-state/match-patterns");

function selectTurningPoints({ seed, world, agents, patterns }) {
  return matchPatterns({
    seed,
    world,
    agents,
    patterns,
    limit: 5
  });
}

module.exports = {
  selectTurningPoints
};
