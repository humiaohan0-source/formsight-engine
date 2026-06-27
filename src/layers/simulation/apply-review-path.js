function selectReviewPath(seed, reviewRules) {
  const requested =
    seed.evidence_mode?.mode ||
    seed.review_path?.mode ||
    seed.product_path?.review_mode ||
    "external_observer";

  return (
    reviewRules.find((rule) => rule.id === requested) ||
    reviewRules.find((rule) => rule.id === "external_observer") ||
    reviewRules[0]
  );
}

function applyReviewPathInfluence({ seed, branchWeights, materialQuality, reviewRules }) {
  const path = selectReviewPath(seed, reviewRules);
  const nextWeights = { ...branchWeights };

  Object.entries(path.branch_effects || {}).forEach(([branch, delta]) => {
    nextWeights[branch] = Number(nextWeights[branch] || 0) + Number(delta || 0);
  });

  const observerCount = (seed.relationship_network?.observer_feedback || []).length;
  const observerBonus = path.id === "external_observer" && observerCount > 0 ? Math.min(observerCount * 4, 12) : 0;
  const structureBonus =
    path.id === "private_structured_material" || path.id === "deep_research_mode"
      ? Number(path.material_quality_bonus || 0)
      : 0;

  return {
    selected_path: {
      id: path.id,
      name: path.name,
      description: path.description,
      model_meaning: path.model_meaning
    },
    branch_weights: nextWeights,
    calibration_effect: {
      observer_bonus: observerBonus,
      structure_bonus: structureBonus,
      adjusted_material_quality_score: Math.min(100, Number(materialQuality.score || 0) + observerBonus + structureBonus),
      interpretation: path.interpretation
    },
    evidence_note:
      path.id === "external_observer"
        ? "External observer evidence increases calibration when it is consent-based and specific."
        : "Private structured material can preserve privacy, but it needs richer detail to compensate for fewer external observations."
  };
}

module.exports = {
  applyReviewPathInfluence
};
