function sampleParallelBranches(selectedAgents, conflicts, stage, world, branchWeights = {}) {
  const primaryAgent = selectedAgents[0];
  const mainConflict = conflicts[0];
  const runwayPhrase = world.scores.financial_runway >= 6 ? "with some financial runway" : "with limited financial runway";
  const mobilityPhrase = world.scores.life_mobility >= 5 ? "external mobility exists" : "external mobility is constrained";

  return [
    {
      id: "inertia",
      name: "Inertia Branch",
      premise: "The current pattern continues.",
      weight: branchWeights.inertia || 1,
      trajectory: `${primaryAgent.name} remains dominant. The person becomes better at surviving ${stage.pressure_fields[0]}, but the unresolved pattern "${mainConflict.name}" keeps narrowing future choices. This happens ${runwayPhrase}, while ${mobilityPhrase}.`,
      likely_inflection: stage.common_inflection_points[0]
    },
    {
      id: "intervention",
      name: "Intervention Branch",
      premise: "One key behavior changes before the next threshold.",
      weight: branchWeights.intervention || 1,
      trajectory: `The person interrupts ${primaryAgent.strategy}. This does not remove fear, but it allows a new branch where ${stage.pressure_fields[1]} becomes negotiable instead of fixed. The branch works only if assets, energy, and family pressure are staged rather than ignored.`,
      likely_inflection: stage.common_inflection_points[1]
    },
    {
      id: "rupture",
      name: "Rupture Branch",
      premise: "Suppressed conflict breaks through.",
      weight: branchWeights.rupture || 1,
      trajectory: `If the conflict remains compressed, ${mainConflict.trajectory_risk} The life path may reset abruptly rather than evolve gradually, especially under high role load or energy risk.`,
      likely_inflection: stage.common_inflection_points[2]
    }
  ];
}

module.exports = {
  sampleParallelBranches
};
