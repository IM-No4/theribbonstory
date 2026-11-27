// Pack options are product option values labelled like "Set of 4".
export const packCount = (label) => {
  const match = /set of\s+(\d+)/i.exec(label || "");
  return match ? Number(match[1]) : 0;
};

// Stock is counted in pieces; a "Set of 4" line uses 4 per unit
export const piecesPerUnit = (selectedOptions) =>
  Math.max(1, ...(selectedOptions || []).map((o) => packCount(o?.value ?? o?.label) || 1));

export const piecesInLine = (line) => (Number(line?.quantity) || 0) * piecesPerUnit(line?.selectedOptions);

export const piecesInCart = (items, productId) =>
  (items || []).filter((i) => i.productId === productId).reduce((sum, i) => sum + piecesInLine(i), 0);

export const hasSetOption = (product) =>
  (product?.optionGroups || []).some((group) => group.values?.some((v) => packCount(v.label) > 1));

/**
 * Real saving of the selected set compared with buying the same number of singles.
 * Returns null when no set is selected or the set is not actually cheaper,
 * so the page can never advertise a saving that doesn't exist.
 */
export const setSaving = (selectedOptions, unitPrice) => {
  const set = Object.values(selectedOptions || {}).find((opt) => packCount(opt?.label) > 1);
  if (!set) return null;
  const count = packCount(set.label);
  const separately = count * (unitPrice - (Number(set.priceDelta) || 0));
  const amount = separately - unitPrice;
  if (amount <= 0) return null;
  return { count, amount, percent: Math.floor((amount / separately) * 100) };
};
