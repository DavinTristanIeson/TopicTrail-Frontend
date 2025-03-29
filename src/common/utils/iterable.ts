import { fromPairs } from 'lodash';

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
