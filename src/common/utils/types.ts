import { type NextPage } from 'next';

/** Remove optionality, null, and undefined from specific properties in a type.

Usage:
type A = {
  a?: string;
  b: number | null;
}
type B = RequiredKeys<A, 'a' | 'b'>
>> B = {
  a: string;
  b: number;
}
*/
export type RequiredKeys<T, K extends keyof T> = T & {
  [key in K]-?: NonNullable<T[key]>;
};

/** Inverse of RequiredKeys. */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & {
  [key in K]+?: T[key];
};

/** Set all keys to nullable. Some api response from backend is in the format
 * ``{nested: {a: null, b: null, c: null}}`` rather than ``{nested: null}``
 * but why tho
 */
export type NullableKeys<T, K extends keyof T> = Omit<T, K> & {
  [key in K]: T[key] | null;
};

export type ReplaceKeys<TSrc, TSub> = Omit<TSrc, keyof TSub & keyof TSrc> &
  TSub;

/** Retrieves all keys of ``T`` whose value can be assigned to ``K`` */
export type KeysOfType<T extends Record<any, any>, K> = {
  [key in keyof T as T[key] extends K ? key : never]: T[key];
};
/**
 * Retrieves all keys of ``T`` that are unknown.
 * https://stackoverflow.com/questions/68232762/check-if-type-is-the-unknown-type
 */
export type UnknownKeysOfType<T extends Record<any, any>> = {
  [key in keyof T as unknown extends T[key] ? key : never]: T[key];
};

export type Promisable<T> = T | Promise<T>;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};
