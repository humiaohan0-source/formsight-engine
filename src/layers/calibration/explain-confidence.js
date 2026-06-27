function confidenceText(level) {
  if (level === "high") return "高置信";
  if (level === "medium") return "中置信";
  return "低置信";
}

function buildConfidenceExplanation({ calibration, materialQuality }) {
  const top = (calibration.confidence_items || []).slice(0, 6).map((item) => ({
    id: item.id,
    name: item.name,
    group_id: item.group_id,
    confidence: Number(item.confidence.toFixed(2)),
    confidence_level: item.confidence_level,
    explanation: `${item.name} 是${confidenceText(item.confidence_level)}判断，来自模式命中强度、证据总量和证据来源广度的共同支持。`
  }));

  const weak = (calibration.confidence_items || [])
    .filter((item) => item.confidence_level === "low")
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      name: item.name,
      explanation: `${item.name} 目前只能作为弱信号，因为材料密度或证据来源还不够。`
    }));

  return {
    summary: {
      reliability_label: calibration.summary.reliability_label,
      material_quality_label: materialQuality.label,
      material_quality_score: materialQuality.score,
      explanation:
        materialQuality.score >= 82
          ? "本次预测的材料密度较高，可以给出更细的人生线推演。"
          : materialQuality.score >= 62
            ? "本次预测可用，但部分结论需要结合低置信提示阅读。"
            : "本次预测更适合作为方向性假设，不适合被当成确定结论。"
    },
    strongest_claims: top,
    weak_claims: weak,
    uncertainty_sources: [
      ...(materialQuality.missing_dimensions || []).map((item) => item.interpretation),
      ...(calibration.contradictions || []).slice(0, 3).map((item) => item.risk)
    ].filter(Boolean)
  };
}

module.exports = {
  buildConfidenceExplanation
};
