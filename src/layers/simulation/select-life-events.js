function selectLifeEvents(stage, world, lifeEvents) {
  const selected = lifeEvents
    .filter((event) => event.stage === "any" || event.stage === stage.id)
    .map((event) => {
      let score = 0;

      if (event.id === "career_threshold" && world.environment.opportunity_density >= 3) score += 2;
      if (event.id === "family_stability_pressure" && world.family.boundary_pressure >= 3) score += 2;
      if (event.id === "relationship_mirror" && world.network.truth_tellers >= 1) score += 2;
      if (event.id === "energy_drop" && world.scores.energy_risk >= 3) score += 2;
      if (event.id === "small_win_window" && world.scores.support_capacity >= 8) score += 2;

      return {
        ...event,
        score
      };
    })
    .filter((event) => event.score > 0)
    .sort((a, b) => b.score - a.score);

  return selected;
}

module.exports = {
  selectLifeEvents
};

