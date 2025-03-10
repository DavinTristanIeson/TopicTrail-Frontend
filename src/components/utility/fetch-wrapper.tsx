import { UseQueryResult } from '@tanstack/react-query';
import { ApiError } from '@/common/api/model';
import Script, { ScriptProps } from 'next/script';
import React from 'react';

import { MaybeFC, MaybeFCType } from '@/components/utility/maybe';
import ErrorViewComponent from '../layout/error-view-component';
import { LoadingOverlay } from '@mantine/core';
import transform from 'lodash/transform';

interface FetchWrapperSharedProps {
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}
export interface WrapperProps extends FetchWrapperSharedProps {
  isLoading?: boolean;
  error?: ApiError | boolean | null;
  onRetry?: () => void;
  children: React.ReactNode;
  showOffline?: boolean;
}

export interface UseQueryWrapperProps<T extends object>
  extends FetchWrapperSharedProps {
  isLoading?: boolean;
  query: UseQueryResult<T, any>;
  children: MaybeFCType<T>;
}

export interface JointQueryWrapperProps<T extends Record<string, any>>
  extends FetchWrapperSharedProps {
  isLoading?: boolean;
  queries: {
    [key in keyof T]: UseQueryResult<T[key], any>;
  };
  children: MaybeFCType<T>;
}

export default function FetchWrapperComponent(props: WrapperProps) {
  const {
    isLoading = false,
    error,
    onRetry,
    loadingComponent,
    children,
    errorComponent,
  } = props;

  if (isLoading) {
    return loadingComponent || <LoadingOverlay visible zIndex={1000} />;
  } else if (error) {
    if (errorComponent) {
      return errorComponent;
    }

    const errorMessage = Object.prototype.hasOwnProperty.call(error, 'message')
      ? (error as ApiError).message
      : undefined;

    return <ErrorViewComponent refetch={onRetry} message={errorMessage} />;
  }

  return children;
}

export function UseQueryWrapperComponent<T extends object>(
  props: UseQueryWrapperProps<T>,
): React.ReactElement {
  const { query, children, isLoading, errorComponent, ...rest } = props;

  return (
    <FetchWrapperComponent
      error={query.error}
      isLoading={
        isLoading == null ? query.isLoading : isLoading && !query?.error
      }
      onRetry={query.refetch}
      errorComponent={errorComponent}
      {...rest}
    >
      {!!query?.data && <MaybeFC props={query.data}>{children}</MaybeFC>}
    </FetchWrapperComponent>
  );
}

export function JointQueryWrapperComponent<T extends Record<string, any>>(
  props: JointQueryWrapperProps<T>,
): React.ReactElement {
  const { queries, children, isLoading, errorComponent, ...rest } = props;

  const queryArray = Object.values(queries);
  const error = queryArray.find((query) => query.error)?.error;
  const loading = queryArray.some((query) => query.isLoading);
  const data = transform(
    queries as Record<string, UseQueryResult<any, any>>,
    (result: Record<string, UseQueryResult<any, any>['data']>, value, key) => {
      result[key] = value.data;
    },
  ) as T;
  return (
    <FetchWrapperComponent
      error={error}
      isLoading={isLoading == null ? loading : isLoading && !error}
      onRetry={() => queryArray.forEach((query) => query.refetch())}
      errorComponent={errorComponent}
      {...rest}
    >
      {Object.values(data).every((x) => !!x) && (
        <MaybeFC props={data}>{children}</MaybeFC>
      )}
    </FetchWrapperComponent>
  );
}

interface ScriptLoaderWrapperComponentProps extends FetchWrapperSharedProps {
  src: string;
  id: string;
  scriptProps?: Omit<ScriptProps, 'src' | 'id' | 'children'>;
  children?: React.ReactNode | (() => React.ReactNode);
}

export function ScriptLoaderWrapperComponent(
  props: ScriptLoaderWrapperComponentProps,
) {
  const { src, id, scriptProps, children, ...fetchWrapperProps } = props;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<ApiError | undefined>(undefined);
  return (
    <>
      <FetchWrapperComponent
        {...fetchWrapperProps}
        isLoading={loading}
        error={error}
      >
        {!loading && error == null
          ? typeof children === 'function'
            ? children()
            : children
          : null}
      </FetchWrapperComponent>
      <Script
        src={src}
        id={id}
        {...scriptProps}
        onReady={() => {
          setLoading(false);
          setError(undefined);
          scriptProps?.onReady?.();
        }}
        onError={(e) => {
          setError({
            message: e?.message ?? e.toString(),
          });
          setLoading(false);
          console.error(e);
          scriptProps?.onError?.(e);
        }}
      />
    </>
  );
}
