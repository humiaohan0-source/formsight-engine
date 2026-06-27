function findRule(branchId, rules) {
  return rules.find((rule) => rule.branch_id === branchId);
}

function variablePhrase(world) {
  const scores = world.scores || {};
  if (Number(scores.energy_risk || 0) >= 7) return "身体和注意力会比理智更早提出反对";
  if (Number(scores.family_gravity || 0) >= 7) return "家庭系统会持续要求一个足够体面的解释";
  if (Number(scores.financial_runway || 0) <= 4) return "资产缓冲会限制每一次转向的速度";
  return "真正决定分支的不是单点选择，而是变量之间的连锁反应";
}

function buildScene(template, context) {
  return template
    .replaceAll("{primary_agent}", context.primaryAgent?.name || "the primary agent")
    .replaceAll("{core_conflict}", context.coreConflict?.name || "the core conflict")
    .replaceAll("{variable_phrase}", variablePhrase(context.world));
}

function buildLifeLineNarratives({ branches, agents, conflicts, world, rules }) {
  const context = {
    primaryAgent: agents[0],
    coreConflict: conflicts[0],
    world
  };

  return branches.map((branch) => {
    const rule = findRule(branch.id, rules);
    if (!rule) return branch;

    return {
      ...branch,
      cinematic_name: rule.cinematic_name,
      narrative_logic: buildScene(rule.narrative_logic, context),
      future_scenes: (rule.future_scenes || []).map((scene) => ({
        horizon: scene.horizon,
        text: buildScene(scene.text, context)
      })),
      shareable_sentence: buildScene(rule.shareable_sentence, context)
    };
  });
}

module.exports = {
  buildLifeLineNarratives
};
