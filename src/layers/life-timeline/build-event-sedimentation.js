function clamp(value, min = -10, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  return Number(Number(value || 0).toFixed(digits));
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function ageStage(age) {
  const numericAge = Number(age);
  if (!Number.isFinite(numericAge)) return "unknown";
  if (numericAge <= 6) return "early_childhood";
  if (numericAge <= 12) return "childhood";
  if (numericAge <= 18) return "adolescence";
  if (numericAge <= 25) return "early_adulthood";
  return "adulthood";
}

function normalizeTimelineEvent(event, index) {
  const text = [
    event.text,
    event.description,
    event.name,
    event.note,
    event.effect,
    event.result
  ].filter(Boolean).join(" ");

  return {
    id: event.id || `timeline_event_${index + 1}`,
    source: event.source || "life_timeline",
    age: event.age,
    stage: ageStage(event.age),
    type: String(event.type || event.category || "event").toLowerCase(),
    text
  };
}

function collectEvents(lifeGraph) {
  const timeline = Array.isArray(lifeGraph?.timeline) ? lifeGraph.timeline : [];
  const events = Array.isArray(lifeGraph?.events) ? lifeGraph.events : [];

  return [...timeline, ...events]
    .filter((event) => event && typeof event === "object")
    .map(normalizeTimelineEvent)
    .filter((event) => event.text || event.type !== "event" || event.age !== undefined);
}

function ruleMatchesEvent(rule, event) {
  const eventType = normalizeText(event.type);
  const text = normalizeText(event.text);
  const typeMatch = (rule.event_types || []).some((type) => {
    const normalizedType = normalizeText(type);
    return eventType === normalizedType || eventType.split(/[^a-z0-9\u4e00-\u9fa5]+/).includes(normalizedType);
  });
  const keywordMatch = (rule.keywords || []).some((keyword) => text.includes(normalizeText(keyword)));

  return typeMatch || keywordMatch;
}

function eventWasRepaired(rule, event) {
  const text = normalizeText(event.text);
  const negatedRepair = [
    "no clear repair",
    "no repair",
    "without repair",
    "was not repaired",
    "never repaired",
    "没有修复",
    "未修复",
    "没有被修复",
    "没人修复"
  ].some((pattern) => text.includes(normalizeText(pattern)));
  if (negatedRepair) return false;

  return (rule.repair_keywords || []).some((keyword) => text.includes(normalizeText(keyword)));
}

function addWeighted(target, source, scale) {
  Object.entries(source || {}).forEach(([key, value]) => {
    target[key] = round(clamp(Number(target[key] || 0) + Number(value || 0) * scale), 3);
  });
}

function sortByAbsValue(object) {
  return Object.entries(object || {})
    .sort((a, b) => Math.abs(Number(b[1] || 0)) - Math.abs(Number(a[1] || 0)));
}

function buildEventSedimentation({ lifeGraph, rules = [] }) {
  const events = collectEvents(lifeGraph);
  const deposits = [];
  const stateBias = {};
  const branchBias = {};
  const periodProfile = {};

  events.forEach((event) => {
    (rules || []).forEach((rule) => {
      if (!ruleMatchesEvent(rule, event)) return;

      const stageMultiplier = Number(rule.age_stages?.[event.stage] || rule.age_stages?.unknown || 1);
      const repaired = eventWasRepaired(rule, event);
      const repairMultiplier = repaired ? 0.65 : 1;
      const intensity = round(Number(rule.base_intensity || 1) * stageMultiplier * repairMultiplier);
      const scale = intensity / 2;
      const localStateBias = {};
      const localBranchBias = {};

      addWeighted(localStateBias, rule.variable_effects, scale);
      addWeighted(localBranchBias, rule.branch_effect, scale);
      addWeighted(stateBias, rule.variable_effects, scale);
      addWeighted(branchBias, rule.branch_effect, scale);

      periodProfile[event.stage] = round(Number(periodProfile[event.stage] || 0) + intensity);
      deposits.push({
        id: `${event.id}:${rule.id}`,
        rule_id: rule.id,
        name: rule.name,
        age: event.age,
        stage: event.stage,
        event_type: event.type,
        event_text: event.text,
        intensity,
        repaired,
        state_bias: localStateBias,
        branch_bias: localBranchBias,
        life_effect: rule.life_effect
      });
    });
  });

  const dominantDeposits = deposits
    .sort((a, b) => Number(b.intensity || 0) - Number(a.intensity || 0))
    .slice(0, 8);

  return {
    events_analyzed: events.length,
    deposits,
    dominant_deposits: dominantDeposits,
    state_bias: Object.fromEntries(sortByAbsValue(stateBias).map(([key, value]) => [key, round(value)])),
    branch_bias: Object.fromEntries(sortByAbsValue(branchBias).map(([key, value]) => [key, round(value)])),
    period_profile: periodProfile,
    total_intensity: round(deposits.reduce((sum, deposit) => sum + Number(deposit.intensity || 0), 0)),
    repair_count: deposits.filter((deposit) => deposit.repaired).length
  };
}

module.exports = {
  buildEventSedimentation
};
