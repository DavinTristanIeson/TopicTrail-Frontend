import { DashboardItemModel } from '@/api/userdata';
import { Button, Collapse, Stack } from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { Faders } from '@phosphor-icons/react';
import React, { useId } from 'react';
import wordwrap from 'wordwrapjs';
export function plotlyWrapText(text: string) {
  return wordwrap
    .wrap(text, {
      width: 80,
    })
    .replaceAll('\n', '<br>');
}

export function usePlotRendererHelperProps(item: DashboardItemModel) {
  const id = useId();
  const [key] = useDebouncedValue(
    `${id}-${item.rect.width}-${item.rect.height}`,
    1000,
    {
      leading: false,
    },
  );
  return {
    key,
  };
}

export function PlotInlineConfiguration(props: React.PropsWithChildren) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <Stack>
      <Button
        variant="subtle"
        leftSection={<Faders />}
        fullWidth
        onClick={toggle}
      >
        {opened ? 'Hide' : 'Show'} Additional Configuration
      </Button>
      <Collapse in={opened}>{opened && props.children}</Collapse>
    </Stack>
  );
}
