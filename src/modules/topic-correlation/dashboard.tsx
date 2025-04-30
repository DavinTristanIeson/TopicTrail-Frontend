import { Alert, Group, Stack } from '@mantine/core';
import { GridSkeleton } from '@/components/visual/loading';
import dynamic from 'next/dynamic';
import {
  useCheckTopicCorrelationTargetVisibility,
  useTopicCorrelationAppState,
  useTopicCorrelationAppStateTopicColumn,
} from './app-state';
import {
  AddVisualizationConfigurationButton,
  DashboardResetButton,
} from '../visualization/dashboard/modals';
import { useDashboardDataManager } from '../userdata/data-manager';
import { useDashboardUserDataSharedBehavior } from '../table/dashboard';
import UserDataManager from '../userdata';
import {
  findProjectColumn,
  getTopicColumnName,
  SchemaColumnModel,
} from '@/api/project';
import {
  DashboardConstraintContext,
  DashboardConstraintContextType,
  DashboardSubdatasetsContext,
  DashboardSubdatasetsContextType,
} from '../visualization/types/context';
import React from 'react';
import { TableFilterModel } from '@/api/table';
import { ProjectContext } from '../project/context';
import { DashboardItemModel } from '@/api/userdata';
import {
  SchemaColumnTypeEnum,
  TableFilterTypeEnum,
} from '@/common/constants/enum';
import { getTopicLabel } from '@/api/topic';
import { DashboardItemTypeEnum } from '../visualization/types/dashboard-item-types';

const GridstackDashboard = dynamic(
  () => import('@/modules/visualization/dashboard'),
  {
    ssr: false,
    loading: GridSkeleton,
  },
);

function useTopicCorrelationDashboardAppState() {
  const project = React.useContext(ProjectContext);
  const column = useTopicCorrelationAppState((store) => store.column);
  const topicColumn = React.useMemo(() => {
    if (!column) return undefined;
    const topicColumnName = getTopicColumnName(column.name);
    return findProjectColumn(project, topicColumnName);
  }, [column, project]);
  const dashboard = useTopicCorrelationAppState(
    (store) => store.dashboard.state,
  );
  const handlers = useTopicCorrelationAppState(
    (store) => store.dashboard.handlers,
  );
  return { project, column, topicColumn, dashboard, handlers };
}

function CorrelationDashboardUserDataManager() {
  const {
    project,
    column: focusedTextualColumn,
    topicColumn: focusedTopicColumn,
    dashboard,
    handlers,
  } = useTopicCorrelationDashboardAppState();
  const rendererProps = useDashboardDataManager(
    useDashboardUserDataSharedBehavior({
      dashboard,
      setDashboard: React.useCallback(
        (dashboard: DashboardItemModel[]) => {
          if (!focusedTextualColumn) return;
          const newDashboard = dashboard
            .map((item) => {
              const column = project.config.data_schema.columns.find(
                (column) => column.name === item.column,
              );
              if (!column) {
                return null;
              }
              if (column.type === SchemaColumnTypeEnum.Textual) {
                return {
                  ...item,
                  column: focusedTextualColumn.name,
                };
              } else if (
                column.type === SchemaColumnTypeEnum.Topic &&
                focusedTopicColumn
              ) {
                return {
                  ...item,
                  column: focusedTopicColumn.name,
                };
              } else {
                return null;
              }
            })
            .filter(Boolean) as DashboardItemModel[];
          handlers.setState(newDashboard);
        },
        [
          focusedTextualColumn,
          focusedTopicColumn,
          handlers,
          project.config.data_schema.columns,
        ],
      ),
    }),
  );
  return <UserDataManager {...rendererProps} label="Dashboard" />;
}

const TOPIC_CORRELATION_DASHBOARD_CONSTRAINT: DashboardConstraintContextType = {
  withoutTypes: [DashboardItemTypeEnum.SubdatasetWords],
};

export default function TopicCorrelationDashboard() {
  const { topicColumn } = useTopicCorrelationAppStateTopicColumn();

  const dashboard = useTopicCorrelationAppState(
    (store) => store.dashboard.state,
  );
  const handlers = useTopicCorrelationAppState(
    (store) => store.dashboard.handlers,
  );
  const correlationTargets = useTopicCorrelationAppState(
    (store) => store.topics,
  );
  const { onlyVisible } = useCheckTopicCorrelationTargetVisibility();
  const { append } = handlers;

  const dashboardSubdatasets = React.useMemo<
    DashboardSubdatasetsContextType | undefined
  >(() => {
    if (!topicColumn) return undefined;
    const wholeDataset = [
      {
        name: 'Dataset',
        filter: null!,
      },
    ];
    const defaultSubdataset =
      onlyVisible(correlationTargets ?? [])
        .map((topic) => {
          return {
            name: getTopicLabel(topic),
            filter: {
              type: TableFilterTypeEnum.EqualTo,
              target: topicColumn?.name,
              value: topic.id,
            } as TableFilterModel,
          };
        })
        .concat(wholeDataset) ?? [];

    return {
      default: defaultSubdataset,
      condition: (item: DashboardItemModel, column: SchemaColumnModel) => {
        const isTopic = column.type === SchemaColumnTypeEnum.Topic;
        const isTextual =
          column.type === SchemaColumnTypeEnum.Textual &&
          item.type !== DashboardItemTypeEnum.WordFrequencies;
        if (isTopic || isTextual) {
          return wholeDataset;
        } else {
          return defaultSubdataset;
        }
      },
    };
  }, [topicColumn, onlyVisible, correlationTargets]);

  if (!topicColumn || !dashboardSubdatasets) {
    return (
      <Alert color="yellow" title="No Topics">
        Choose a column to be analyzed in &quot;Topics Manager&quot; first.
      </Alert>
    );
  }
  if (dashboardSubdatasets.default.length === 0) {
    return (
      <Alert color="yellow" title="No Topics">
        Choose at least one topics to be shown from &quot;Topics Manager&quot;
        first.
      </Alert>
    );
  }
  return (
    <DashboardSubdatasetsContext.Provider value={dashboardSubdatasets}>
      <DashboardConstraintContext.Provider
        value={TOPIC_CORRELATION_DASHBOARD_CONSTRAINT}
      >
        <Stack>
          <CorrelationDashboardUserDataManager />
          <Group justify="end">
            <DashboardResetButton onReset={() => handlers.setState([])} />
            <AddVisualizationConfigurationButton onSubmit={append} />
          </Group>
          <GridstackDashboard
            dashboard={dashboard}
            dashboardHandlers={handlers}
          />
        </Stack>
      </DashboardConstraintContext.Provider>
    </DashboardSubdatasetsContext.Provider>
  );
}
