import {
  Button,
  type PolymorphicComponentProps,
  type ButtonProps,
} from '@mantine/core';
import { X } from '@phosphor-icons/react';

export function CancelButton(
  props: PolymorphicComponentProps<'button', ButtonProps>,
) {
  return (
    <Button
      leftSection={<X />}
      color="red"
      variant="outline"
      // eslint-disable-next-line react/no-children-prop
      children="Cancel"
      {...props}
    />
  );
}
