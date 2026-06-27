function getLifeStage(seed, stages) {
  const id = seed.profile?.life_stage || "early_adulthood";
  return stages.find((stage) => stage.id === id) || stages[0];
}

module.exports = {
  getLifeStage
};

