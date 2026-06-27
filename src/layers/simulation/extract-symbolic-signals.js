const { normalizeSeedText, collectSeedTextFragments } = require("../seed-material/normalize-seed");

const SYMBOLIC_MATERIAL_FIELDS = {
  names: "name",
  places: "place",
  objects: "object",
  pets: "care_responsibility",
  recurring_words: "phrase",
  dreams: "dream",
  digital_identities: "online_identity",
  unfinished_artifacts: "project",
  dates: "date",
  numbers: "number",
  institutions: "institution",
  relationship_objects: "relationship",
  body_marks: "health",
  long_texts: "long_text"
};

const LONG_TEXT_HINTS = [
  { type: "name", keywords: ["\u540d\u5b57", "\u7f72\u540d", "\u7b14\u540d", "\u7f51\u540d", "nickname", "handle"] },
  { type: "place", keywords: ["\u57ce\u5e02", "\u642c\u5bb6", "\u5e38\u4f4f", "\u79bb\u5f00", "\u56de\u5230", "\u5f02\u5730", "place"] },
  { type: "object", keywords: ["\u7269\u54c1", "\u4e66\u684c", "\u623f\u95f4", "\u793c\u7269", "\u7167\u7247", "\u804a\u5929\u8bb0\u5f55", "object"] },
  { type: "dream", keywords: ["\u68a6", "\u53cd\u590d\u68a6", "dream"] },
  { type: "phrase", keywords: ["\u53cd\u590d", "\u4e00\u53e5\u8bdd", "\u603b\u662f", "\u8bcd", "phrase"] },
  { type: "date", keywords: ["\u65e5\u671f", "\u751f\u65e5", "\u5468\u5e74", "\u622a\u6b62", "\u5012\u8ba1\u65f6", "deadline"] },
  { type: "institution", keywords: ["\u5b66\u6821", "\u516c\u53f8", "\u5355\u4f4d", "\u673a\u6784", "school", "company"] },
  { type: "project", keywords: ["\u9879\u76ee", "\u4f5c\u54c1", "github", "\u5f00\u6e90", "demo", "product"] },
  { type: "health", keywords: ["\u8eab\u4f53", "\u75c5", "\u836f", "\u4f24", "\u68c0\u67e5", "health"] },
  { type: "relationship", keywords: ["\u5173\u7cfb", "\u524d\u4efb", "\u5973\u670b\u53cb", "\u7537\u670b\u53cb", "\u670b\u53cb", "\u5bb6\u4eba", "relationship"] }
];

function excerpt(text, maxLength = 96) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3)}...`;
}

function normalizeAnchorItem(item, type, source) {
  if (typeof item === "string") {
    return {
      type,
      label: type === "long_text" ? excerpt(item) : item,
      evidence_text: type === "long_text" ? item : undefined,
      source
    };
  }

  const label = item.label || item.text || item.name || item.value || item.meaning;

  return {
    type: item.type || type,
    label: type === "long_text" ? excerpt(label) : label,
    meaning: item.meaning,
    evidence_text: type === "long_text" ? label : item.evidence_text,
    source: item.source || source
  };
}

function collectSymbolicMaterialAnchors(seed) {
  const material = seed.symbolic_material || {};

  return Object.entries(SYMBOLIC_MATERIAL_FIELDS).flatMap(([field, type]) => {
    const value = material[field];
    if (!value) return [];
    const items = Array.isArray(value) ? value : [value];

    return items.map((item, index) => normalizeAnchorItem(item, type, `symbolic_material.${field}[${index}]`));
  });
}

function inferAnchorsFromLongText(seed) {
  const fragments = collectSeedTextFragments(seed).filter((fragment) => fragment.text.trim().length >= 32);
  return fragments.flatMap((fragment) => {
    const text = fragment.text.toLowerCase();
    return LONG_TEXT_HINTS
      .filter((hint) => hint.keywords.some((keyword) => text.includes(String(keyword).toLowerCase())))
      .map((hint) => ({
        type: hint.type,
        label: excerpt(fragment.text),
        evidence_text: fragment.text,
        source: fragment.path,
        inferred: true
      }));
  });
}

function dedupeAnchors(anchors) {
  const seen = new Set();
  return anchors.filter((anchor) => {
    const key = `${anchor.type}:${String(anchor.label || "").toLowerCase()}:${anchor.source || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectAnchors(seed) {
  const anchors = [
    ...(seed.symbolic_anchors || []),
    ...collectSymbolicMaterialAnchors(seed),
    ...inferAnchorsFromLongText(seed),
    ...(seed.life_timeline || []).map((item) => ({
      type: item.type,
      label: item.text,
      source: "life_timeline"
    })),
    ...(seed.recent_events || []).map((item) => ({
      type: item.type,
      label: item.text,
      source: "recent_events"
    })),
    ...(seed.repeated_patterns || []).map((item) => ({
      type: "repeated_pattern",
      label: item,
      source: "repeated_patterns"
    }))
  ];

  if (seed.profile?.city) {
    anchors.push({
      type: "place",
      label: seed.profile.city,
      source: "profile.city"
    });
  }

  if (seed.profile?.name || seed.profile?.name_meaning || seed.profile?.name_components) {
    anchors.push({
      type: "name",
      label: [seed.profile.name, seed.profile.name_meaning, ...(seed.profile.name_components || [])].filter(Boolean).join(" / "),
      source: "profile.name"
    });
  }

  return dedupeAnchors(anchors.filter((anchor) => anchor.label));
}

function keywordHits(text, keywords = []) {
  return keywords.filter((keyword) => text.includes(String(keyword).toLowerCase()));
}

function matchRule(anchor, rule) {
  const text = `${anchor.type} ${anchor.label}`.toLowerCase();
  const typeOk = !rule.anchor_types?.length || rule.anchor_types.includes(anchor.type);
  const hits = keywordHits(text, rule.keywords || []);
  const matched = typeOk && hits.length > 0;

  return {
    matched,
    hits
  };
}

function applySymbolicBranchEffects(branchWeights, symbolicSignals) {
  const next = { ...branchWeights };

  symbolicSignals.forEach((signal) => {
    Object.entries(signal.branch_effect || {}).forEach(([branch, delta]) => {
      next[branch] = Number(next[branch] || 0) + Number(delta || 0);
    });
  });

  return next;
}

function extractSymbolicSignals({ seed, rules, branchWeights }) {
  const anchors = collectAnchors(seed);
  const seedText = normalizeSeedText(seed);
  const signals = [];

  rules.forEach((rule) => {
    const matchedAnchors = anchors
      .map((anchor) => {
        const result = matchRule(anchor, rule);
        return result.matched ? { ...anchor, hits: result.hits } : null;
      })
      .filter(Boolean);
    const globalHits = keywordHits(seedText, rule.global_keywords || []);

    if (!matchedAnchors.length && !globalHits.length) return;

    signals.push({
      id: rule.id,
      name: rule.name,
      confidence: rule.confidence || "weak",
      interpretation: rule.interpretation,
      life_effect: rule.life_effect,
      matched_anchors: matchedAnchors.slice(0, 5),
      global_hits: globalHits,
      branch_effect: rule.branch_effect || {},
      state_effect: rule.state_effect || {}
    });
  });

  return {
    anchors,
    signals,
    branch_weights: applySymbolicBranchEffects(branchWeights, signals)
  };
}

module.exports = {
  extractSymbolicSignals,
  applySymbolicBranchEffects
};
