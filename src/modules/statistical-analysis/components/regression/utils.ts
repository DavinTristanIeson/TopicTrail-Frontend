export function pValueToConfidenceLevel(p_value: number) {
  if (p_value == null) return null as unknown as number;
  return (1 - p_value) * 100;
}

export function formatConfidenceLevel(p_value: number) {
  const confidence = pValueToConfidenceLevel(p_value);
  if (confidence != null) {
    return `${confidence.toFixed(3)}%`;
  } else {
    return confidence;
  }
}

export function formatConfidenceInterval(interval: [number, number]) {
  if (interval[0] == null || interval[1] == null) {
    return '-';
  }
  return `${interval[0].toFixed(3)} - ${interval[1].toFixed(3)}`;
}
