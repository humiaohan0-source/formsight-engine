function collectSeedTextFragments(value, path = "seed") {
  if (typeof value === "string") {
    return value.trim() ? [{ path, text: value }] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectSeedTextFragments(item, `${path}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectSeedTextFragments(item, `${path}.${key}`));
  }

  return [];
}

function normalizeSeedText(seed) {
  return collectSeedTextFragments(seed)
    .map((item) => item.text)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

module.exports = {
  normalizeSeedText,
  collectSeedTextFragments
};
