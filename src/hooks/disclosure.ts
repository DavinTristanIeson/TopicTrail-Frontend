import { useDisclosure } from '@mantine/hooks';
import React, { useImperativeHandle } from 'react';
import { useCombinedRefs } from './ref';

export interface DisclosureTrigger {
  open(): void;
  close(): void;
  toggle(): void;
}

export function useDisclosureTrigger(
  ref: React.ForwardedRef<DisclosureTrigger | null>,
) {
  const innerRef = React.useRef<DisclosureTrigger>();
  const combinedRef = useCombinedRefs(innerRef, ref as any);
  const disclosure = useDisclosure();
  const [, { open, close, toggle }] = disclosure;
  useImperativeHandle(combinedRef, () => {
    return {
      open,
      close,
      toggle,
    } as DisclosureTrigger;
  });
  return disclosure;
}

export interface ParametrizedDisclosureTrigger<T> {
  open(params: T): void;
  close(): void;
}

export function useParametrizedDisclosureTrigger<T>(
  ref?: React.ForwardedRef<ParametrizedDisclosureTrigger<T> | null>,
) {
  const innerRef = React.useRef<ParametrizedDisclosureTrigger<T>>();
  const combinedRef = useCombinedRefs(innerRef, ref as any);

  const [data, setData] = React.useState<T | undefined>(undefined);
  const open = (payload: T) => setData(payload);
  const close = () => setData(undefined);

  useImperativeHandle(combinedRef, () => {
    return {
      open,
      close,
    } as DisclosureTrigger;
  });
  return [data, { open, close }] as const;
}
