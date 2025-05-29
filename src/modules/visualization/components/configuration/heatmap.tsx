export function getRawHeatmapZRange(Z: number[][]) {
  let maxZ: number | undefined = undefined;
  let minZ: number | undefined = undefined;
  for (const row of Z) {
    for (const col of row) {
      if (col == null) continue;
      maxZ = Math.max(col, maxZ ?? col);
      minZ = Math.min(col, minZ ?? col);
    }
  }
  return [minZ ?? 0, maxZ ?? 0] as [number, number];
}

export function getBalancedHeatmapZRange(Z: number[][], base: number = 0) {
  const [minZ, maxZ] = getRawHeatmapZRange(Z);
  const threshold = Math.max(Math.abs(minZ), maxZ);
  return [base - threshold, base + threshold] as [number, number];
}
