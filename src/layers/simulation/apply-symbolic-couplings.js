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

function applySymbolicCouplings({
  symbolicSignals,
  innerAgents,
  externalAgents,
  world,
  branchWeights,
  rules
}) {
  const symbolicIds = new Set((symbolicSignals.signals || []).map((signal) => signal.id));
  const innerIds = new Set(innerAgents.map((agent) => agent.id));
  const externalIds = new Set(externalAgents.map((agent) => agent.id));
  const nextWeights = { ...branchWeights };

  const matched = rules.filter((rule) => {
    const conditions = rule.if || {};

    return (
      hasAll(symbolicIds, conditions.symbolic_all || []) &&
      hasAny(symbolicIds, conditions.symbolic_any || []) &&
      hasAll(innerIds, conditions.inner_agents_all || []) &&
      hasAny(innerIds, conditions.inner_agents_any || []) &&
      hasAll(externalIds, conditions.external_agents_all || []) &&
      hasAny(externalIds, conditions.external_agents_any || []) &&
      matchScoreConditions(world.scores, conditions.world_scores || {})
    );
  });

  matched.forEach((rule) => {
    Object.entries(rule.branch_effects || {}).forEach(([branch, delta]) => {
      nextWeights[branch] = Number(nextWeights[branch] || 0) + Number(delta || 0);
    });
  });

  return {
    matched_symbolic_couplings: matched,
    branch_weights: nextWeights
  };
}

module.exports = {
  applySymbolicCouplings
};
