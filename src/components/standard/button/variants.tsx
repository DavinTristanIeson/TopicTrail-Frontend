import {
  Button,
  type PolymorphicComponentProps,
  type ButtonProps,
  ActionIcon,
} from '@mantine/core';
import { Eye, EyeSlash, X } from '@phosphor-icons/react';
import React from 'react';

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

interface VisibilityActionIconProps {
  visible: boolean;
  setVisibility(visible: boolean): void;
}

export function VisibilityActionIcon(props: VisibilityActionIconProps) {
  const { visible, setVisibility } = props;
  return (
    <ActionIcon
      onClick={() => {
        setVisibility(!visible);
      }}
      color={visible ? 'green' : 'red'}
      variant="outline"
    >
      {visible ? <Eye /> : <EyeSlash />}
    </ActionIcon>
  );
}
