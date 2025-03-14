import React, { useEffect, useRef } from 'react';

export function useCombinedRefs(
  ...refs: (React.MutableRefObject<any> | ((ref: any) => void))[]
): React.MutableRefObject<any> {
  const targetRef = useRef();

  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}

export function useSyncRefsToSource<T>(
  sourceRef: React.MutableRefObject<T>,
  ...refs: (React.MutableRefObject<T | undefined> | undefined)[]
) {
  useEffect(() => {
    refs.forEach((ref) => {
      if (!ref) return;

      ref.current = sourceRef.current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export type ManyRef<T> = Record<string, React.RefObject<T>>;
export function useManyRefs<T = any>(
  ids: (string | number)[],
): React.MutableRefObject<ManyRef<T>> {
  const manyRefs = React.useRef<ManyRef<T>>({});
  for (const id of ids) {
    manyRefs.current[id] = manyRefs.current[id] ?? React.createRef();
  }
  return manyRefs;
}
