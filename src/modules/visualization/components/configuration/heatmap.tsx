export function getRawHeatmapZRange(Z: number[][]) {
  let maxZ = 0;
  let minZ = 0;
  for (const row of Z) {
    for (const col of row) {
      maxZ = Math.max(col, maxZ);
      minZ = Math.min(col, minZ);
    }
  }
  return [minZ, maxZ] as [number, number];
}

export function getBalancedHeatmapZRange(Z: number[][]) {
  const [minZ, maxZ] = getRawHeatmapZRange(Z);
  const threshold = Math.max(minZ, maxZ);
  return [-threshold, threshold] as [number, number];
}
