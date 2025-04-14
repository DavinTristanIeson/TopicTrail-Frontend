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
      {data && <Component data={data} item={item} />}
    </FetchWrapperComponent>
  );
}

export function DashboardItemRenderer(props: DashboardItemModel) {
  const { type: rawType } = props;
  const type = rawType as DashboardItemTypeEnum;
  const dashboardConfig = DASHBOARD_ITEM_CONFIGURATION[type];
  if (!dashboardConfig) {
    return (
      <Alert color="gray" icon={<X />}>
        This is no longer a valid dashboard item. Please reconfigure or delete
        this item from your dashboard.
      </Alert>
    );
  }
  return (
    <DashboardItemRendererInternal config={dashboardConfig} item={props} />
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
        <HoverCard>
          <HoverCard.Target>
            <Info size={24} color={colors.brand[6]} />
          </HoverCard.Target>
          <HoverCard.Dropdown className="max-w-md">
            <Text>{item.description}</Text>
          </HoverCard.Dropdown>
        </HoverCard>
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
