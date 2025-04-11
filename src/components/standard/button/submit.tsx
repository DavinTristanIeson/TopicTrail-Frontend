import { useFormContext } from 'react-hook-form';
import { Button, type ButtonProps, Tooltip } from '@mantine/core';
import { FloppyDisk } from '@phosphor-icons/react';
import { isEmpty } from 'lodash';

export default function SubmitButton(props: ButtonProps) {
  const {
    formState: { isSubmitting, isDirty, errors },
  } = useFormContext();
  const isError = !isEmpty(errors) && isDirty;
  return (
    <Tooltip
      label="There are unresolved errors in the form."
      color="red"
      disabled={!isError}
    >
      <Button
        leftSection={<FloppyDisk />}
        // eslint-disable-next-line react/no-children-prop
        children="Save"
        {...props}
        type="submit"
        loading={isSubmitting}
        disabled={props.disabled || isError}
      />
    </Tooltip>
  );
}
