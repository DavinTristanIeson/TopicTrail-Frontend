import { DashboardItemModel } from '@/api/userdata';
import { Stack, Button, Collapse } from '@mantine/core';
import {
  useDebouncedValue,
  useDisclosure,
  useId,
  useViewportSize,
} from '@mantine/hooks';
import { Faders } from '@phosphor-icons/react';
import React from 'react';
export * from './categorical';
export * from '../../../statistic-test/components/plot-config';

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

interface PlotRendererContextType {
  isFullScreen: boolean;
}

export const PlotRendererContext = React.createContext<PlotRendererContextType>(
  {
    isFullScreen: false,
  },
);
export function usePlotRendererHelperProps(item: DashboardItemModel) {
  const id = useId();
  const { isFullScreen } = React.useContext(PlotRendererContext);
  const [key] = useDebouncedValue(
    `${id}-${item.rect.width}-${item.rect.height}`,
    1000,
    {
      leading: false,
    },
  );
  const { height } = useViewportSize();
  return {
    key,
    height: isFullScreen ? height * 0.8 : undefined,
  };
}
