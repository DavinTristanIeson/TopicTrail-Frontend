import { classNames } from '@/common/utils/styles';
import { useFormContext } from 'react-hook-form';
import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { FloppyDisk } from '@phosphor-icons/react';

export default function SubmitButton(props: ButtonProps) {
  const {
    formState: { isSubmitting, isDirty, isValid },
  } = useFormContext();
  const isError = !isValid && isDirty;
  return (
    <Tooltip
      label="There are unresolved errors in the form."
      color="red"
      disabled={!isError}
    >
      <Button
        {...props}
        type="submit"
        loading={isSubmitting}
        disabled={props.disabled || isError}
        className={classNames(props.className)}
        leftSection={<FloppyDisk size={20} />}
      />
    </Tooltip>
  );
}
