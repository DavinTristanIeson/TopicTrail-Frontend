import React from 'react';

interface UseNestedStateProps<T> {
  state: Record<string, T>;
  setState: React.Dispatch<React.SetStateAction<Record<string, T>>>;
  defaultFactory(): T;
}

export interface UseNestedStateReturn<T> {
  all: Record<string, T>;
  get(key: string): T;
  set(key: string, value: React.SetStateAction<T>): void;
  reset(key: string): void;
}

export function useNestedState<T>(props: UseNestedStateProps<T>) {
  const { state, setState, defaultFactory } = props;

  const defaultValue = React.useMemo(() => {
    return defaultFactory();
  }, [defaultFactory]);

  const getNestedState = React.useCallback(
    (key: string) => {
      return state[key] ?? defaultValue;
    },
    [defaultValue, state],
  );

  const setNestedState = React.useCallback(
    (key: string, action: React.SetStateAction<T>) => {
      setState((prev) => {
        let newState: T;
        if (typeof action === 'function') {
          newState = (action as any)(prev[key] ?? defaultValue);
        } else {
          newState = action;
        }
        return {
          ...prev,
          [key]: newState,
        };
      });
    },
    [defaultValue, setState],
  );

  const resetNestedState = React.useCallback(
    (key: string) => {
      setState((prev) => {
        return {
          ...prev,
          [key]: defaultValue,
        };
      });
    },
    [defaultValue, setState],
  );

  return {
    all: state,
    get: getNestedState,
    set: setNestedState,
    reset: resetNestedState,
  };
}
