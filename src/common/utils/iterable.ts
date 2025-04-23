import { fromPairs } from 'lodash-es';

export function pickArrayById<T>(
  array: T[],
  ids: string[],
  predicate: (value: T) => string,
): T[];
export function pickArrayById<T>(
  array: T[],
  ids: number[],
  predicate: (value: T) => number,
): T[];
export function pickArrayById<T>(
  array: T[],
  ids: string[] | number[],
  predicate: (value: T) => string | number,
): T[] {
  const arrayMapper = fromPairs(
    array.map((value) => [predicate(value), value]),
  );
  return ids.map((id) => arrayMapper[id]!).filter(Boolean);
}

export function pickArrayByIndex<T>(array: T[], indices: number[]): T[] {
  const result: T[] = [];
  for (const index of indices) {
    result.push(array[index]!);
  }
  return result;
}

export function filterByString(
  search: string,
  candidates: Record<string, string | string[] | null | undefined>[],
): number[] {
  if (!search) {
    return Array.from(candidates, (_, i) => i);
  }
  const searchValue = search.toLowerCase();
  const indices = [];
  for (let i = 0; i < candidates.length; i++) {
    const searchTargets = Object.values(candidates[i]!);
    for (const target of searchTargets) {
      if (!target) {
        continue;
      }
      let verdict: boolean;
      if (Array.isArray(target)) {
        verdict = target
          .map((keyword) => keyword.toLowerCase())
          .includes(searchValue);
      } else {
        verdict = target.toLowerCase().includes(searchValue);
      }

      if (verdict) {
        indices.push(i);
        break;
      }
    }
  }
  return indices;
}

export function zip2D<T>(arrays: T[][][]): T[][][] {
  const rows = arrays[0]!.length;
  const cols = arrays[0]![0]!.length;
  const buffer: T[][][] = [];
  for (let r = 0; r < rows; r++) {
    const row: T[][] = [];
    for (let c = 0; c < cols; c++) {
      const col: T[] = [];
      for (let i = 0; i < arrays.length; i++) {
        col.push(arrays[i]![r]![c]!);
      }
      row.push(col);
    }
    buffer.push(row);
  }
  return buffer;
}

export function sort2D<T>(
  arr: T[][],
  rowIndices: number[],
  columnIndices: number[],
): T[][] {
  const buffer = [];
  for (let i = 0; i < arr.length; i++) {
    // Sort by column first
    buffer.push(pickArrayByIndex(arr[i]!, columnIndices));
  }
  // Then sort by row. Order doesn't matter.
  return pickArrayByIndex(buffer, rowIndices);
}

export function map2D<TSrc, TDist>(
  arr: TSrc[][],
  fn: (value: TSrc, row: number, col: number) => TDist,
) {
  const buffer: TDist[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const row: TDist[] = [];
    for (let j = 0; j < arr[i]!.length; j++) {
      const value = fn(arr[i]![j]!, i, j);
      row.push(value);
    }
    buffer.push(row);
  }
  return buffer;
}

export function mask2D<T>(arr: T[][], mask: boolean[][], value: T) {
  return map2D(arr, (original, i, j) => {
    const valid = !!mask[i]?.[j];
    return valid ? value : original;
  });
}
