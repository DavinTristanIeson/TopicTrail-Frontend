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
