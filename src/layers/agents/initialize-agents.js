const { normalizeSeedText } = require("../seed-material/normalize-seed");

function scoreInnerAgents(seed, agents) {
  const text = normalizeSeedText(seed);
  return agents
    .map((agent) => {
      const keywordHits = agent.keywords.reduce((score, keyword) => {
        return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      return {
        ...agent,
        score: keywordHits
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter((agent) => agent.score > 0)
    .slice(0, 4);
}

function matchConflicts(selectedAgents, conflictRules) {
  const selected = new Set(selectedAgents.map((agent) => agent.id));
  return conflictRules
    .map((rule) => ({
      ...rule,
      score: rule.agents.filter((agentId) => selected.has(agentId)).length
    }))
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function initializeAgents(seed, agentDefinitions, conflictRules) {
  const innerAgents = scoreInnerAgents(seed, agentDefinitions);
  const conflicts = matchConflicts(innerAgents, conflictRules);

  return {
    innerAgents,
    conflicts
  };
}

module.exports = {
  initializeAgents
};

