import { DashboardItemModel } from '@/api/userdata';
import { Stack, Button, Collapse } from '@mantine/core';
import { useDebouncedValue, useDisclosure, useId } from '@mantine/hooks';
import { Faders } from '@phosphor-icons/react';
export * from './categorical';
export * from './statistic-test';

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
      <Collapse in={opened}>
        <Stack>{opened && props.children}</Stack>
      </Collapse>
    </Stack>
  );
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
