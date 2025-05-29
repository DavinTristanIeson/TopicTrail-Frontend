export function pValueToConfidenceLevel(p_value: number) {
  return (1 - p_value) * 100;
}

export function formatConfidenceInterval(interval: [number, number]) {
  if (interval[0] == null || interval[0] == null) {
    return 'Invalid Interval';
  }
  return `${interval[0].toFixed(3)} - ${interval[1].toFixed(3)}`;
}
