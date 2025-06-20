import { getAnyError } from '@/common/utils/error';
import { Alert } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Warning } from '@phosphor-icons/react';
import { get } from 'lodash-es';
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
    fields[props.names[i]!] = values[i];
  }

  return <>{props.children?.(fields)}</>;
}

export function useWatchFieldError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  return getAnyError(get(errors, name))?.message;
}

export function ErrorAlert() {
  const {
    formState: { errors },
  } = useFormContext();
  const anyError = getAnyError(errors);
  const [debouncedAnyError] = useDebouncedValue(anyError?.message, 1000, {
    leading: false,
  });

  if (!debouncedAnyError) {
    return null;
  }
  return (
    <Alert
      title="There's an error in the form!"
      icon={<Warning size={18} />}
      color="red"
    >
      {debouncedAnyError}
      <br />
      You will not be allowed to submit the form until all errors are resolved.
    </Alert>
  );
}
