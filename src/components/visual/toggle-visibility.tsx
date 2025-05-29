import { Stack, Button, Collapse } from '@mantine/core';
import { EyeSlash, Eye } from '@phosphor-icons/react';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';

interface ToggleVisibilityProps {
  children?: React.ReactNode;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  label: string;
  defaultVisible: boolean;
}

export function ToggleVisibility(props: ToggleVisibilityProps) {
  const { children, label, activeIcon, inactiveIcon, defaultVisible } = props;
  const [opened, { toggle }] = useDisclosure(defaultVisible);
  return (
    <Stack>
      <Button
        onClick={toggle}
        leftSection={
          opened ? (activeIcon ?? <EyeSlash />) : (inactiveIcon ?? <Eye />)
        }
        variant="subtle"
      >
        {(opened ? 'Hide' : 'Show') + ' ' + label}
      </Button>
      <Collapse in={opened}>{children}</Collapse>
    </Stack>
  );
}
