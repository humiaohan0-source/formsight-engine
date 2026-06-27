const { normalizeSeedText } = require("../seed-material/normalize-seed");

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function countItems(value) {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).filter((key) => value[key] !== undefined).length;
  return value ? 1 : 0;
}

function collectEvidenceProfile(seed, sourceWeights) {
  const sources = {
    behavior_history: [
      ...(seed.recent_events || []),
      ...(seed.life_timeline || []),
      ...(seed.repeated_patterns || [])
    ],
    observer_feedback: seed.relationship_network?.observer_feedback || [],
    structured_facts: [
      seed.assets,
      seed.environment,
      seed.family_system,
      seed.relationship_network,
      seed.health_and_energy,
      seed.social_capital,
      seed.wealth_path,
      seed.macro_era
    ].filter(Boolean),
    self_report: seed.profile?.self_description || [],
    aspiration_fear: [
      ...(seed.desired_future || []),
      ...(seed.feared_future || []),
      seed.value_system?.value_conflict
    ].filter(Boolean),
    model_inference: []
  };

  const evidenceSources = Object.entries(sourceWeights).map(([id, definition]) => {
    const count = countItems(sources[id]);
    const weighted_score = count * Number(definition.weight || 1);

    return {
      id,
      name: definition.name,
      weight: definition.weight,
      count,
      weighted_score,
      description: definition.description
    };
  });

  const totalEvidenceScore = evidenceSources.reduce((sum, source) => sum + source.weighted_score, 0);

  return {
    sources: evidenceSources,
    total_evidence_score: totalEvidenceScore
  };
}

function flattenPatternGroups(patternGroups) {
  return Object.entries(patternGroups).flatMap(([groupId, patterns]) => {
    return (patterns || []).map((pattern) => ({
      ...pattern,
      group_id: groupId
    }));
  });
}

function confidenceLevel(score) {
  if (score >= 0.72) return "high";
  if (score >= 0.42) return "medium";
  return "low";
}

function calibratePatternConfidence(patternGroups, evidenceProfile) {
  const evidenceStrength = clamp(evidenceProfile.total_evidence_score / 80, 0, 1);

  return flattenPatternGroups(patternGroups)
    .map((pattern) => {
      const patternStrength = clamp(Number(pattern.score || 0) / 8, 0, 1);
      const sourceBreadth = clamp(evidenceProfile.sources.filter((source) => source.count > 0).length / 5, 0, 1);
      const confidence = clamp(patternStrength * 0.55 + evidenceStrength * 0.3 + sourceBreadth * 0.15);

      return {
        id: pattern.id,
        name: pattern.name,
        group_id: pattern.group_id,
        pattern_score: pattern.score,
        confidence,
        confidence_level: confidenceLevel(confidence)
      };
    })
    .sort((a, b) => b.confidence - a.confidence);
}

function detectContradictions(seed, contradictionRules) {
  const text = normalizeSeedText(seed);

  return contradictionRules
    .map((rule) => {
      const hits = (rule.if_all_keywords || []).filter((keyword) => text.includes(String(keyword).toLowerCase()));
      const matched = hits.length === (rule.if_all_keywords || []).length;

      return {
        ...rule,
        hits,
        confidence_score: matched ? clamp(0.55 + Number(rule.confidence_bonus || 0) * 0.1) : 0
      };
    })
    .filter((rule) => rule.confidence_score > 0)
    .sort((a, b) => b.confidence_score - a.confidence_score);
}

function summarizeCalibration(confidenceItems, contradictions, evidenceProfile) {
  const high = confidenceItems.filter((item) => item.confidence_level === "high").length;
  const medium = confidenceItems.filter((item) => item.confidence_level === "medium").length;
  const low = confidenceItems.filter((item) => item.confidence_level === "low").length;

  return {
    evidence_score: evidenceProfile.total_evidence_score,
    high_confidence_count: high,
    medium_confidence_count: medium,
    low_confidence_count: low,
    contradiction_count: contradictions.length,
    reliability_label:
      evidenceProfile.total_evidence_score >= 55 && contradictions.length >= 2
        ? "well-calibrated"
        : evidenceProfile.total_evidence_score >= 30
          ? "usable"
          : "thin-evidence"
  };
}

function calibratePredictions({ seed, sourceWeights, contradictionRules, patternGroups }) {
  const evidenceProfile = collectEvidenceProfile(seed, sourceWeights);
  const confidenceItems = calibratePatternConfidence(patternGroups, evidenceProfile);
  const contradictions = detectContradictions(seed, contradictionRules);

  return {
    evidence_profile: evidenceProfile,
    confidence_items: confidenceItems,
    contradictions,
    summary: summarizeCalibration(confidenceItems, contradictions, evidenceProfile)
  };
}

module.exports = {
  calibratePredictions
};
