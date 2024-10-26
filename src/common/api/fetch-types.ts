/** Shorthand convenience types for useQuery, useInfiniteQuery, and useMutation so that we don't have to specify all of the types. */

import {
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { ApiError } from './model';

type GenericApiQueryFunction<TInput, TResult, TOptions> = [TInput] extends [
  never,
]
  ? (options?: TOptions) => TResult
  : (input: TInput, options?: TOptions) => TResult;

export type ApiQueryFunction<
  TInput,
  TData,
  TError = ApiError,
> = GenericApiQueryFunction<
  TInput,
  UseQueryResult<TData, TError>,
  Partial<UseQueryOptions<TData, TError>>
>;

export type InfiniteApiQueryFunction<
  TInput,
  TData,
  TError = ApiError,
> = GenericApiQueryFunction<
  TInput,
  UseInfiniteQueryResult<TData, TError>,
  Partial<UseInfiniteQueryOptions<TData, TError>>
>;

export type ApiMutationFunction<
  TInput,
  TResult,
  TError = ApiError,
  TConfig = never,
> = GenericApiQueryFunction<
  TConfig,
  UseMutationResult<TResult, TError, TInput>,
  Partial<UseMutationOptions<TResult, TError, TInput>>
>;
