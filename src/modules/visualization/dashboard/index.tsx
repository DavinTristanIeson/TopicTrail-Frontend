import {
  useControlledGridstack,
  useSubscribedGridStackChanges,
} from '@/hooks/gridstack';
import { type GridStackWidget } from 'gridstack';
import React from 'react';
import DashboardGridItem from './grid-item';
import { DashboardItemModel } from '@/api/userdata';
import { fromPairs } from 'lodash-es';
import {
  DashboardGridItemDeleteModal,
  DashboardGridItemFullScreenModal,
  VisualizationConfigurationDialog,
} from './modals';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';
import { type UseListStateHandlers } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import DashboardTopicCheatsheet from './topic-cheatsheet';

interface GridstackDashboardProps {
  dashboard: DashboardItemModel[];
  dashboardHandlers: UseListStateHandlers<DashboardItemModel>;
}

export default function GridstackDashboard(props: GridstackDashboardProps) {
  const { dashboard, dashboardHandlers } = props;

  const dragHandleClassName = 'gridstack-dashboard-drag-handle';

  const { setState: setDashboard } = dashboardHandlers;
  const dashboardMap = React.useMemo(() => {
    return fromPairs(dashboard.map((item) => [item.id, item]));
  }, [dashboard]);
  const makeWidget = React.useCallback(
    (id: string) => {
      const commonProps = {
        id,
        minH: 3,
        minW: 3,
      };
      if (!dashboardMap[id]) {
        return commonProps;
      }
      return {
        ...commonProps,
        w: Math.max(3, dashboardMap[id].rect.width),
        h: Math.max(3, dashboardMap[id].rect.height),
        x: dashboardMap[id].rect.x,
        y: dashboardMap[id].rect.y,
      } as GridStackWidget;
    },
    [dashboardMap],
  );
  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: dashboard.map((item) => item.id),
    options: {
      removable: false,
      margin: 4,
      draggable: {
        handle: `.${dragHandleClassName}`,
      },
    },
    makeWidget,
  });

  useSubscribedGridStackChanges({
    grid,
    onChange: React.useCallback(
      (changes) => {
        setDashboard((dashboard) => {
          const changesMap = fromPairs(
            changes.map((change) => [change.id, change]),
          );
          const newDashboardItems = dashboard.map((item) => {
            const change = changesMap[item.id];
            if (!change) return item;
            return {
              ...item,
              rect: {
                x: change.x,
                height: change.h,
                width: change.w,
                y: change.y,
              },
            };
          });
          return newDashboardItems;
        });
      },
      [setDashboard],
    ),
  });

  const fullScreenRemote =
    React.useRef<ParametrizedDisclosureTrigger<DashboardItemModel> | null>(
      null,
    );
  const editRemote =
    React.useRef<ParametrizedDisclosureTrigger<DashboardItemModel> | null>(
      null,
    );
  const deleteRemote =
    React.useRef<ParametrizedDisclosureTrigger<DashboardItemModel> | null>(
      null,
    );

  const setDashboardItem = React.useCallback(
    (newItem: DashboardItemModel) => {
      const index = dashboard.findIndex((item) => item.id === newItem.id);
      if (index === -1) {
        dashboardHandlers.append(newItem);
        showNotification({
          message: 'Successfully added a new visualization component',
          color: 'green',
        });
      } else {
        dashboardHandlers.setItem(index, newItem);
        showNotification({
          message: 'Successfully updated the visualization component',
          color: 'green',
        });
      }
    },
    [dashboard, dashboardHandlers],
  );

  return (
    <>
      <DashboardGridItemFullScreenModal
        ref={fullScreenRemote}
        onSubmit={setDashboardItem}
      />
      <DashboardGridItemDeleteModal
        ref={deleteRemote}
        items={dashboard}
        removeDashboardItem={dashboardHandlers.remove}
      />
      <VisualizationConfigurationDialog
        ref={editRemote}
        onSubmit={setDashboardItem}
      />
      <DashboardTopicCheatsheet dashboard={dashboard} />
      <div className="rounded color-gray-100">
        <div className="grid-stack" id={id}>
          {dashboard.map((item) => (
            <div
              className="grid-stack-item"
              ref={gridElements.current[item.id]}
              key={item.id}
            >
              <DashboardGridItem
                item={item}
                onFullScreen={() => fullScreenRemote.current?.open(item)}
                onEdit={() => editRemote.current?.open(item)}
                onDelete={() => deleteRemote.current?.open(item)}
                dragHandleClassName={dragHandleClassName}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
