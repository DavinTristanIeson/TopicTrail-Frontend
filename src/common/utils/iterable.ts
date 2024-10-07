function mustBeArray<T>(arr: T | T[]): T[] {
  return Array.isArray(arr) ? arr : [arr];
}

/**
 * A convenience function for writing conditional elements in arrays.
 *
 * ### Example:
 *
 * ```
 * [...maybeElement(true, 3), 4, ...maybeElement(false, 6), ...maybeElement(false, 7, 8)] // [3, 8]
 * ```
 *
 * ### Problem:
 *
 * ``{...(false && {a: "hello"})}`` will resolve to ``{a: "hello"}``, but ``[...(false && "hello")]`` will cause a TypeError. Object spread will ignore the boolean, but array spread will attempt to spread false and end up throwing a TypeError. maybeElement will return an empty array rather than false/undefined/null to avoid that situation.
 */
export function maybeElement<T>(
  condition: boolean,
  then: T | T[],
  otherwise: T | T[] = [],
): T[] {
  return condition ? mustBeArray(then) : mustBeArray(otherwise);
}

/**
 * Creates an object from an array, which can be used for faster look-ups on big data sets rather than using .find(). Note that array.prototype.find may perform better for smaller datasets.
 */
export function createSearchMap<TData, TResult>(
  data: readonly TData[],
  predicate: (src: TData, index: number) => [string, TResult] | undefined,
  // Intentional undefined union to prevent false positives in types. For example, createSearchMap<string, string>([])['a'] should return string | undefined, rather than just string.
): Record<string, TResult | undefined> {
  const map: {
    [key: string]: TResult;
  } = Object.create(null);
  for (let i = 0; i < data.length; i++) {
    const returned = predicate(data[i], i);
    if (returned === undefined) continue;
    const [key, value] = returned;
    map[key] = value;
  }
  return map;
}

/**
 * Categorizes an array of ``TData`` into an object with its keys being the string returned by ``predicate``, and its value an array of ``TData`` which when evaluated by ``predicate`` returned that key.
 *
 * If the predicate returns undefined, then the value will be discarded.
 */
export function categorize<TData, TKeys extends string | number | symbol>(
  data: readonly TData[],
  predicate: (src: TData) => TKeys | undefined,
): Record<TKeys, TData[]> {
  const map: {
    [key in TKeys]: TData[];
  } = Object.create(null);
  for (const datum of data) {
    const key = predicate(datum);
    if (key === undefined) continue;
    if (!(key in map)) {
      map[key] = [datum];
    } else {
      map[key].push(datum);
    }
  }
  return map;
}

export function findMultiple<TData, TKeys extends string | number | symbol>(
  data: readonly TData[],
  predicate: (src: TData) => TKeys | null,
): Record<TKeys, TData> {
  const map: {
    [key in TKeys]: TData;
  } = Object.create(null);
  for (const datum of data) {
    const key = predicate(datum);
    if (key === undefined || key === null) continue;
    map[key] = datum;
  }
  return map;
}

export function reduceMultiple<
  TInput,
  TOutput,
  TKeys extends string | number | symbol,
>(
  data: readonly TInput[],
  identifier: (src: TInput) => TKeys,
  reducer: (acc: TOutput, cur: TInput, key: TKeys) => TOutput,
  initialValue: TOutput | (() => TOutput),
): Record<TKeys, TOutput> {
  const map: {
    [key in TKeys]: TOutput;
  } = Object.create(null);
  for (const datum of data) {
    const key = identifier(datum);
    const currentState =
      key in map
        ? map[key]
        : typeof initialValue === 'function'
          ? ((initialValue as any)() as TOutput)
          : initialValue;
    map[key] = reducer(currentState, datum, key);
  }
  return map;
}

/**
 * Creates a new array with the values replaced according to ``predicate``. If ``predicate`` returns undefined, the original value will be used.
 */
export function replaceWhere<TData>(
  data: readonly TData[],
  predicate: (src: TData) => TData | undefined,
) {
  const replaced = Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const replacement = predicate(data[i]);
    replaced[i] = replacement === undefined ? data[i] : replacement;
  }
  return data;
}

/**
 * Used for getting the state of checkboxes that summarize a list of data. It returns two boolean values in a tuple:
 *
 * The first value is used to determine if the checkbox is checked or not (there is at least one data that is checked), the second value is used to determine if the checkbox is indeterminate or not (there are some data that are checked, but not all).
 */
export function getCheckboxState<TData>(
  data: readonly TData[],
  predicate: (src: TData) => boolean,
): [boolean, boolean] {
  let allChecked = true,
    someChecked = false;
  for (const datum of data) {
    const checked = predicate(datum);
    // At least one selected
    if (checked) someChecked = true;
    // At least one that is not selected
    else allChecked = false;
    // Early break, state will no longer change if allChecked = false and someChecked = true.
    if (someChecked && !allChecked) {
      break;
    }
  }
  return [
    // Is any checked
    someChecked,
    // indeterminate if not all checked, but some checked
    !allChecked && someChecked,
  ];
}

/* Array.prototype.map, but works on objects. Returning undefined will filter the key out from the result */
export function mapObject<
  TSrc,
  TResult,
  TKeys extends string | number | symbol,
>(
  src: Record<string, TSrc>,
  predicate: (key: string, src: TSrc) => [TKeys, TResult] | undefined,
): Record<TKeys, TResult> {
  const result = Object.create(null);
  for (const key in src) {
    const pred = predicate(key, src[key]);
    if (pred === undefined) continue;
    result[pred[0]] = pred[1];
  }
  return result;
}

/** Checks for shallow equality by default */
export function isArrayEqual<T>(
  a: T[],
  b: T[],
  pred: (a: T, b: T, index: number) => boolean = (a, b) => a === b,
): boolean {
  let equal = a.length === b.length;
  if (!equal) return equal;
  for (let i = 0; i < a.length; i++) {
    if (!pred(a[i], b[i], i)) {
      equal = false;
      break;
    }
  }
  return equal;
}

interface IsShallowEqualOptions<T extends object> {
  ignore: (keyof T)[];
}
export function isShallowEqual<T extends object>(
  a: T,
  b: T,
  options?: Partial<IsShallowEqualOptions<T>>,
) {
  const keys = Object.keys(a);
  const ignoreKeys: Record<keyof T, boolean> = options?.ignore
    ? createSearchMap(options.ignore, (src) => [src as string, true])
    : Object.create(null);
  let equal = true;
  for (const key of keys) {
    const k = key as keyof T
    if (ignoreKeys[k]) continue;
    if (a[k] !== b[k]) {
      equal = false;
      break;
    }
  }
  return equal;
}

/** Returns an array with only distinct items from the original array. ``predicate`` should return a hash/id value for every element in the array. You can return undefined to exclude the item from the final array. */
export function distinct<T>(
  arr: T[],
  predicate: (src: T) => string | undefined,
) {
  const searchMap = Object.create(null);
  const distinctArray: T[] = [];
  for (const src of arr) {
    const key = predicate(src);
    if (key === undefined || key in searchMap) {
      continue;
    }
    searchMap[key] = true;
    distinctArray.push(src);
  }
  return distinctArray;
}

export function countElements<T>(arr: T[], pred: (item: T) => boolean): number {
  let count = 0;
  for (const item of arr) {
    if (pred(item)) {
      count++;
    }
  }
  return count;
}

/** Get the item and index which is considered optimal by the predicate. The predicate takes the current element and the maximum element and compares them, if the predicate returns true then the current element becomes the new maximum element. The function returns [undefined, -1] if there's no element found (this is so that the result can be trivially destructured) */
export function optimalElement<T>(
  arr: T[],
  pred: (cur: T, max: T) => boolean,
): [T, number] | [undefined, -1] {
  let maxElement: T | undefined = arr[0],
    maxIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    const curElement = arr[i];
    if (pred(curElement, maxElement)) {
      maxElement = curElement;
      maxIndex = i;
    }
  }
  return maxElement === undefined ? [undefined, -1] : [maxElement, maxIndex];
}

/** Returns a new array based on ``arr`` without the elements in ``remove`` and with the elements in ``append``. */
export function spliceElements<T>(arr: T[], remove: T | T[], append?: T | T[]) {
  const arr2 = Array.isArray(remove)
    ? arr.filter((x) => !remove.includes(x))
    : arr.filter((x) => x !== remove);
  if (append) {
    if (Array.isArray(append)) {
      arr2.push(...append);
    } else {
      arr2.push(append);
    }
  }
  return arr2;
}

export function uniqueByKeepLast<T>(arr: T[], key: (item: T) => any) {
  return [...new Map(arr.map((x) => [key(x), x])).values()];
}

export function getKeyByValue<T>(object: Record<string, T>, value: T): string | undefined {
  return Object.keys(object).find((key) => object[key] === value);
}
