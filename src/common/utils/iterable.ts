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

export function sort2D(
  arr: number[][],
  rowIndices: number[],
  columnIndices: number[],
) {
  const buffer = [];
  for (let i = 0; i < arr.length; i++) {
    // Sort by column first
    buffer.push(pickArrayByIndex(arr[i]!, columnIndices));
  }
  // Then sort by row. Order doesn't matter.
  return pickArrayByIndex(buffer, rowIndices);
}

export function mask2D<T>(arr: T[][], mask: boolean[][], value: T) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i]!.length; j++) {
      arr[i]![j] = value;
    }
  }
  return arr;
}
