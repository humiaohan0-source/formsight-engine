function hasAny(ids, required = []) {
  if (!required.length) return true;
  return required.some((id) => ids.has(id));
}

function hasAll(ids, required = []) {
  return required.every((id) => ids.has(id));
}

function matchScoreConditions(scores = {}, conditions = {}) {
  return Object.entries(conditions).every(([key, target]) => {
    if (key.endsWith("_gte")) return Number(scores[key.replace("_gte", "")] || 0) >= Number(target);
    if (key.endsWith("_lte")) return Number(scores[key.replace("_lte", "")] || 0) <= Number(target);
    return scores[key] === target;
  });
}

function flattenPatternIds(patternGroups = {}) {
  return new Set(Object.values(patternGroups).flatMap((patterns) => (patterns || []).map((pattern) => pattern.id)));
}

function applyAdvancedCouplings({ innerAgents, externalAgents, world, patternGroups, branchWeights, rules }) {
  const inner = new Set(innerAgents.map((agent) => agent.id));
  const external = new Set(externalAgents.map((agent) => agent.id));
  const patternIds = flattenPatternIds(patternGroups);
  const nextWeights = { ...branchWeights };

  const matched = rules.filter((rule) => {
    const conditions = rule.if || {};
    return (
      hasAll(inner, conditions.inner_agents_all || []) &&
      hasAny(inner, conditions.inner_agents_any || []) &&
      hasAll(external, conditions.external_agents_all || []) &&
      hasAny(external, conditions.external_agents_any || []) &&
      hasAll(patternIds, conditions.patterns_all || []) &&
      hasAny(patternIds, conditions.patterns_any || []) &&
      matchScoreConditions(world.scores, conditions.world_scores || {})
    );
  });

  matched.forEach((rule) => {
    Object.entries(rule.branch_effects || {}).forEach(([branch, delta]) => {
      nextWeights[branch] = Number(nextWeights[branch] || 0) + Number(delta || 0);
    });
  });

  return {
    matched_advanced_couplings: matched,
    branch_weights: nextWeights
  };
}

module.exports = {
  applyAdvancedCouplings
};
