import { formatNumber } from '@/common/utils/number';

export function pValueToConfidenceLevel(p_value: number) {
  if (p_value == null) return null as unknown as number;
  return (1 - p_value) * 100;
}

export function formatConfidenceLevel(p_value: number) {
  const confidence = pValueToConfidenceLevel(p_value);
  if (confidence != null) {
    return `${formatNumber(confidence)}%`;
  } else {
    return confidence;
  }
}

export function formatConfidenceInterval(interval: [number, number]) {
  if (interval[0] == null || interval[1] == null) {
    return '-';
  }
  return `${formatNumber(interval[0])} - ${formatNumber(interval[1])}`;
}

export function formatProbabilityConfidenceInterval(
  interval: [number, number],
) {
  if (interval[0] == null || interval[1] == null) {
    return '-';
  }
  return `${formatNumber(interval[0] * 100)}% - ${formatNumber(interval[1] * 100)}%`;
}
