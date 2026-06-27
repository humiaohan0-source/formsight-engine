function matchesScoreCondition(worldScores, conditions = {}) {
  return Object.entries(conditions).every(([key, value]) => {
    if (key.endsWith("_gte")) {
      const scoreName = key.replace("_gte", "");
      return Number(worldScores[scoreName] || 0) >= Number(value);
    }

    if (key.endsWith("_lte")) {
      const scoreName = key.replace("_lte", "");
      return Number(worldScores[scoreName] || 0) <= Number(value);
    }

    return worldScores[key] === value;
  });
}

function applyCouplingRules({ innerAgents, externalAgents, world, rules }) {
  const inner = new Set(innerAgents.map((agent) => agent.id));
  const external = new Set(externalAgents.map((agent) => agent.id));

  const matched = rules.filter((rule) => {
    const innerOk = (rule.if.inner_agents || []).every((agentId) => inner.has(agentId));
    const externalOk = (rule.if.external_agents || []).every((agentId) => external.has(agentId));
    const scoreOk = matchesScoreCondition(world.scores, rule.if.world_scores);
    return innerOk && externalOk && scoreOk;
  });

  const branchWeights = {
    inertia: 1,
    intervention: 1,
    rupture: 1
  };

  matched.forEach((rule) => {
    branchWeights[rule.effect.branch] += Number(rule.effect.weight_delta || 0);
  });

  return {
    matchedCouplings: matched,
    branchWeights
  };
}

module.exports = {
  applyCouplingRules
};

