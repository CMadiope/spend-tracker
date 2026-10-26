export function parseRandsToCents(input: string): number | null {
  let text = input.replace(/[\s  ]/g, "");
  text = text.replace(/^R/i, "");
  if (text === "" || !/^[\d.,]+$/.test(text)) return null;

  const lastSeparator = Math.max(text.lastIndexOf(","), text.lastIndexOf("."));
  let whole = text;
  let fraction = "";

  if (lastSeparator !== -1) {
    const separator = text[lastSeparator];
    const before = text.slice(0, lastSeparator);
    const after = text.slice(lastSeparator + 1);
    const isOnlySeparator = !/[.,]/.test(before);
    const looksLikeGrouping =
      after.length === 3 && (isOnlySeparator || before.includes(separator));

    if (!looksLikeGrouping) {
      if (after.length === 0 || after.length > 2) return null;
      if (before.includes(separator)) return null;
      whole = before;
      fraction = after;
    }
  }

  if (whole.includes(",") && whole.includes(".")) return null;
  const groups = whole.split(/[.,]/);
  if (
    groups.some((group, i) => group === "" || (i > 0 && group.length !== 3))
  ) {
    return null;
  }

  const cents = Number(groups.join("")) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}
