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
import React from 'react';
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

  const { data, error, loading } = useDataProvider(item);

  return (
    <FetchWrapperComponent error={error} isLoading={loading}>
      {data &&
        (data.length === 0 ? (
          <Alert color="red" icon={<Warning />} withCloseButton>
            There is no data to be visualized. Create a subdataset to get
            started.
          </Alert>
        ) : (
          <Component data={data} item={item} />
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
  return (
    <div className="relative">
      <DashboardItemRendererInternal
        config={dashboardConfig}
        item={{
          ...props,
          config: dashboardItemInternalConfig,
        }}
      />
    </div>
  );
}

interface DashboardGridItemProps {
  item: DashboardItemModel;
  dragHandleClassName: string;
  onEdit: ((item: DashboardItemModel) => void) | undefined;
  onDelete: ((item: DashboardItemModel) => void) | undefined;
  onFullScreen: ((item: DashboardItemModel) => void) | undefined;
}

export default function DashboardGridItem(props: DashboardGridItemProps) {
  const { item, onEdit, onDelete, onFullScreen, dragHandleClassName } = props;
  const { colors } = useMantineTheme();
  return (
    <Paper className="grid-stack-item-content p-2 select-none">
      <Group className="pb-2">
        <DotsSixVertical className={dragHandleClassName} />
        <div className="flex-1" />
        {onFullScreen && (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onFullScreen(item)}
          >
            <CornersOut size={24} />
          </ActionIcon>
        )}
        {item.description && (
          <HoverCard>
            <HoverCard.Target>
              <Info size={24} color={colors.brand[6]} />
            </HoverCard.Target>
            <HoverCard.Dropdown className="max-w-md">
              <Text>{item.description}</Text>
            </HoverCard.Dropdown>
          </HoverCard>
        )}
        {onEdit && (
          <ActionIcon variant="subtle" onClick={() => onEdit(item)}>
            <PencilSimple size={24} />
          </ActionIcon>
        )}
        {onDelete && (
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => onDelete(item)}
          >
            <TrashSimple size={24} />
          </ActionIcon>
        )}
      </Group>
      <DefaultErrorViewBoundary>
        <DashboardItemRenderer {...item} />
      </DefaultErrorViewBoundary>
    </Paper>
  );
}
