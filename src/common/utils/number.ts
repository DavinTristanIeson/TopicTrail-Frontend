export function formatNumber(value: number, digits: number = 3) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  });
}
