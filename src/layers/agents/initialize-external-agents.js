function flattenWorldText(lifeGraph) {
  return [
    lifeGraph.profile?.city,
    lifeGraph.profile?.industry,
    ...(lifeGraph.roles || []).map((role) => role.description),
    lifeGraph.family?.family_expectation,
    lifeGraph.family?.unspoken_family_rule,
    ...(lifeGraph.network?.observer_feedback || []),
    ...(lifeGraph.assets?.skill_assets || []),
    ...(lifeGraph.assets?.reputation_assets || []),
    JSON.stringify(lifeGraph.environment || {}),
    JSON.stringify(lifeGraph.health || {})
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function initializeExternalAgents(lifeGraph, externalAgentDefinitions) {
  const text = flattenWorldText(lifeGraph);

  return externalAgentDefinitions
    .map((agent) => {
      const keywordHits = agent.keywords.reduce((score, keyword) => {
        return score + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      return {
        ...agent,
        score: keywordHits
      };
    })
    .filter((agent) => agent.score > 0)
    .sort((a, b) => b.score - a.score);
}

module.exports = {
  initializeExternalAgents
};

