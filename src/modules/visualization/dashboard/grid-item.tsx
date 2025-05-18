import { DashboardItemModel } from '@/api/userdata';
import { DefaultErrorViewBoundary } from '@/components/visual/error';
import {
  ActionIcon,
  Alert,
  Group,
  HoverCard,
  Paper,
  useMantineTheme,
  Text,
  Stack,
  Divider,
  Skeleton,
} from '@mantine/core';
import {
  CornersOut,
  DotsSixVertical,
  Info,
  PencilSimple,
  TrashSimple,
  Warning,
  X,
} from '@phosphor-icons/react';
import React, { Suspense } from 'react';
import { DASHBOARD_ITEM_CONFIGURATION } from '../types/dashboard-item-configuration';
import { DashboardItemTypeEnum } from '../types/dashboard-item-types';
import { VisualizationConfigEntry } from '../types/base';
import FetchWrapperComponent from '@/components/utility/fetch-wrapper';

interface DashboardItemRendererInternalProps {
  item: DashboardItemModel;
  config: VisualizationConfigEntry<any, any>;
}

function DashboardItemRendererInternal(
  props: DashboardItemRendererInternalProps,
) {
  const {
    item,
    config: { component: Component, dataProvider: useDataProvider },
  } = props;

  const { data, error, loading, refetch } = useDataProvider(item);

  return (
    <FetchWrapperComponent
      error={error}
      isLoading={loading}
      onRetry={refetch}
      loadingComponent={<Skeleton className="w-full h-full" />}
    >
      {data &&
        (data.length === 0 ? (
          <Alert color="red" icon={<Warning />} withCloseButton>
            There is no data to be visualized. Create a subdataset to get
            started.
          </Alert>
        ) : (
          <Suspense fallback={<Skeleton className="w-full h-full" />}>
            <Component data={data} item={item} />
          </Suspense>
        ))}
    </FetchWrapperComponent>
  );
}

export function DashboardItemRenderer(props: DashboardItemModel) {
  const { type: rawType, config: rawConfig } = props;
  const type = rawType as DashboardItemTypeEnum;
  const dashboardConfig = DASHBOARD_ITEM_CONFIGURATION[type];

  const dashboardItemInternalConfig = React.useMemo(() => {
    if (!dashboardConfig?.configValidator) {
      return rawConfig;
    }
    try {
      return dashboardConfig?.configValidator?.validateSync(rawConfig);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [dashboardConfig?.configValidator, rawConfig]);

  const [shouldRender, setShouldRender] = React.useState(false);
  React.useEffect(() => {
    // Wait until Gridstack.js resolves the sizes of the grid items first.
    setTimeout(() => {
      setShouldRender(true);
    }, 500);
  }, []);

  if (!dashboardConfig) {
    return (
      <Alert color="gray" icon={<X />}>
        This is no longer a valid dashboard item. Please reconfigure or delete
        this item from your dashboard.
      </Alert>
    );
  }
  if (!dashboardItemInternalConfig) {
    return (
      <Alert color="red" icon={<Warning />}>
        There&apos;s an error in the configuration of this dashboard item. Try
        to update the configuration or create a new dashboard item instead.
      </Alert>
    );
  }
  if (!shouldRender) return;
  return (
    <div className="relative">
      <DashboardItemRendererInternal
        config={dashboardConfig}
        key={JSON.stringify(rawConfig)}
        item={{
          ...props,
          config: dashboardItemInternalConfig,
        }}
      />
    </div>
  );
}

function DashboardGridItemInfo(props: DashboardItemModel) {
  const dashboardConfig =
    DASHBOARD_ITEM_CONFIGURATION[props.type as DashboardItemTypeEnum]!;
  const { colors } = useMantineTheme();

  if (!dashboardConfig) {
    return null;
  }

  return (
    <HoverCard>
      <HoverCard.Target>
        <Info size={24} color={colors.brand[6]} />
      </HoverCard.Target>
      <HoverCard.Dropdown className="max-w-md">
        <Stack>
          <Text size="lg" fw={500}>
            {dashboardConfig.label}
          </Text>
          <Text>{dashboardConfig.description}</Text>
          {props.description && (
            <>
              <Divider />
              <Text>{props.description}</Text>
            </>
          )}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

interface DashboardGridItemProps {
  item: DashboardItemModel;
  dragHandleClassName: string;
  onEdit(): void;
  onDelete(): void;
  onFullScreen(): void;
}

export default function DashboardGridItem(props: DashboardGridItemProps) {
  const { item, onEdit, onDelete, onFullScreen, dragHandleClassName } = props;
  return (
    <Paper className="grid-stack-item-content p-2 select-none">
      <Group className="pb-2">
        <DotsSixVertical className={dragHandleClassName} />
        <div className="flex-1" />
        <ActionIcon variant="subtle" color="gray" onClick={onFullScreen}>
          <CornersOut size={24} />
        </ActionIcon>
        <DashboardGridItemInfo {...item} />
        <ActionIcon variant="subtle" onClick={onEdit}>
          <PencilSimple size={24} />
        </ActionIcon>
        <ActionIcon color="red" variant="subtle" onClick={onDelete}>
          <TrashSimple size={24} />
        </ActionIcon>
      </Group>
      <DefaultErrorViewBoundary>
        <DashboardItemRenderer {...item} />
      </DefaultErrorViewBoundary>
    </Paper>
  );
}
