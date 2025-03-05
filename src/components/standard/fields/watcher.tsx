import { getAnyError } from '@/common/utils/error';
import { get } from 'lodash';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface FieldWatcherProps {
  names: string[];
  children?(values: Record<string, any>): React.ReactNode;
}

export default function FieldWatcher(props: FieldWatcherProps) {
  const values = useWatch({
    name: props.names,
  });

  const fields: Record<string, any> = {};
  for (let i = 0; i < props.names.length; i++) {
    fields[props.names[i]] = values[i];
  }

  return <>{props.children?.(fields)}</>;
}

export function useWatchFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  return getAnyError(get(errors, name))?.message;
}
