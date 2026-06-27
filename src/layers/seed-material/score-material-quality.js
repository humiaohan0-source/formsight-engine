function count(value) {
  if (Array.isArray(value)) return value.filter(Boolean).length;
  if (value && typeof value === "object") return Object.values(value).filter((item) => item !== undefined && item !== "").length;
  return value ? 1 : 0;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreDimension(seed, rule) {
  const rawCount = (rule.paths || []).reduce((sum, path) => {
    const value = path.split(".").reduce((cursor, key) => cursor?.[key], seed);
    return sum + count(value);
  }, 0);
  const score = clamp((rawCount / Number(rule.target_count || 1)) * Number(rule.max_score || 10), 0, Number(rule.max_score || 10));

  return {
    id: rule.id,
    name: rule.name,
    score: Number(score.toFixed(1)),
    max_score: rule.max_score,
    raw_count: rawCount,
    interpretation: rawCount >= Number(rule.target_count || 1) ? rule.strong_interpretation : rule.thin_interpretation
  };
}

function qualityLabel(score) {
  if (score >= 82) return "high-resolution";
  if (score >= 62) return "usable";
  if (score >= 42) return "thin-but-readable";
  return "low-resolution";
}

function scoreMaterialQuality(seed, rules) {
  const dimensions = rules.map((rule) => scoreDimension(seed, rule));
  const totalScore = dimensions.reduce((sum, item) => sum + item.score, 0);
  const maxScore = dimensions.reduce((sum, item) => sum + Number(item.max_score || 0), 0) || 1;
  const normalizedScore = Math.round((totalScore / maxScore) * 100);
  const missingDimensions = dimensions.filter((item) => item.score < Number(item.max_score || 0) * 0.45);

  return {
    score: normalizedScore,
    label: qualityLabel(normalizedScore),
    dimensions,
    missing_dimensions: missingDimensions.map((item) => ({
      id: item.id,
      name: item.name,
      interpretation: item.interpretation
    })),
    interpretation:
      normalizedScore >= 82
        ? "The seed material is dense enough for high-resolution simulation."
        : normalizedScore >= 62
          ? "The seed material can support a useful simulation, with some low-resolution areas."
          : "The simulation should be read as directional because the seed material is still thin."
  };
}

module.exports = {
  scoreMaterialQuality
};
