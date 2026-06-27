const { normalizeSeedText } = require("../seed-material/normalize-seed");

function getContextValue(world, key) {
  const direct = world.scores?.[key];
  if (direct !== undefined) return direct;

  return (
    world.assets?.[key] ??
    world.environment?.[key] ??
    world.family?.[key] ??
    world.education_path?.[key] ??
    world.intergenerational_family?.[key] ??
    world.place_mobility?.[key] ??
    world.peer_authority?.[key] ??
    world.class_money_shame?.[key] ??
    world.body_image_gender?.[key] ??
    world.time_rhythm?.[key] ??
    world.digital_information?.[key] ??
    world.meaning_belief?.[key] ??
    world.romantic_history?.[key] ??
    world.worldview_orientation?.[key] ??
    world.agency_control?.[key] ??
    world.time_future_orientation?.[key] ??
    world.network?.[key] ??
    world.health?.[key] ??
    world.scores?.[key] ??
    world.value_system?.[key] ??
    world.decision_style?.[key] ??
    world.social_capital?.[key] ??
    world.intimacy_path?.[key] ??
    world.wealth_path?.[key] ??
    world.macro_era?.[key]
  );
}

function matchesCondition(world, key, expected) {
  if (key.endsWith("_gte")) {
    return Number(getContextValue(world, key.replace("_gte", "")) || 0) >= Number(expected);
  }

  if (key.endsWith("_lte")) {
    return Number(getContextValue(world, key.replace("_lte", "")) || 0) <= Number(expected);
  }

  if (key.endsWith("_min")) {
    const value = getContextValue(world, key.replace("_min", ""));
    return Array.isArray(value) ? value.length >= Number(expected) : Number(value || 0) >= Number(expected);
  }

  return getContextValue(world, key) === expected;
}

function conditionScore(world, conditions = {}) {
  const entries = Object.entries(conditions);
  if (!entries.length) return 0;
  return entries.every(([key, value]) => matchesCondition(world, key, value)) ? entries.length * 2 : 0;
}

function keywordScore(seed, pattern) {
  const text = normalizeSeedText(seed);
  return (pattern.keywords || pattern.signals || []).reduce((score, keyword) => {
    return score + (text.includes(String(keyword).toLowerCase()) ? 1 : 0);
  }, 0);
}

function agentScore(agents, pattern) {
  const active = new Set(agents.map((agent) => agent.id));
  return (pattern.amplifies || pattern.tests || []).reduce((score, agentId) => {
    return score + (active.has(agentId) ? 1 : 0);
  }, 0);
}

function matchPatterns({ seed, world, agents, patterns, limit = 4 }) {
  return patterns
    .map((pattern) => {
      const score =
        keywordScore(seed, pattern) +
        conditionScore(world, pattern.conditions) +
        agentScore(agents, pattern);

      return {
        ...pattern,
        score
      };
    })
    .filter((pattern) => pattern.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function applyPatternBranchEffects(branchWeights, patternGroups) {
  const nextWeights = { ...branchWeights };

  patternGroups.flat().forEach((pattern) => {
    Object.entries(pattern.branch_effect || {}).forEach(([branch, delta]) => {
      nextWeights[branch] = Number(nextWeights[branch] || 0) + Number(delta || 0);
    });
  });

  return nextWeights;
}

module.exports = {
  matchPatterns,
  applyPatternBranchEffects
};
