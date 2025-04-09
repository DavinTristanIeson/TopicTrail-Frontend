import { TextualSchemaColumnModel } from '@/api/project';
import {
  TopicVisualizationModel,
  DocumentTopicsVisualizationModel,
} from '@/api/topic';
import { client } from '@/common/api/client';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { WidePlotSkeleton } from '@/components/visual/loading';
import { ProjectContext, SchemaColumnContext } from '@/modules/project/context';
import React from 'react';

export interface TopicVisualizationRendererProps {
  data: TopicVisualizationModel[];
  column: TextualSchemaColumnModel;
}

interface TopicVisualizationDataProviderProps {
  children(props: TopicVisualizationRendererProps): React.ReactNode;
}

export function TopicVisualizationDataProvider(
  props: TopicVisualizationDataProviderProps,
) {
  const { children: Child } = props;
  const project = React.useContext(ProjectContext);
  const column = React.useContext(
    SchemaColumnContext,
  ) as TextualSchemaColumnModel;
  const query = client.useQuery(
    'get',
    '/topic/{project_id}/visualization/topics',
    {
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name,
        },
      },
    },
  );
  const data = query.data?.data;
  return (
    <UseQueryWrapperComponent
      query={query}
      loadingComponent={<WidePlotSkeleton />}
    >
      {data && <Child data={data} column={column} />}
    </UseQueryWrapperComponent>
  );
}

export interface DocumentTopicsVisualizationRendererProps {
  data: DocumentTopicsVisualizationModel;
  column: TextualSchemaColumnModel;
}

interface DocumentTopicsVisualizationDataProviderProps {
  children(props: DocumentTopicsVisualizationRendererProps): React.ReactNode;
}

export function DocumentTopicsVisualizationDataProvider(
  props: DocumentTopicsVisualizationDataProviderProps,
) {
  const { children: Child } = props;
  const project = React.useContext(ProjectContext);
  const column = React.useContext(
    SchemaColumnContext,
  ) as TextualSchemaColumnModel;
  const query = client.useQuery(
    'get',
    '/topic/{project_id}/visualization/documents',
    {
      params: {
        path: {
          project_id: project.id,
        },
        query: {
          column: column.name,
        },
      },
    },
  );
  const data = query.data?.data;

  return (
    <UseQueryWrapperComponent
      query={query}
      loadingComponent={<WidePlotSkeleton />}
    >
      {data && <Child data={data} column={column} />}
    </UseQueryWrapperComponent>
  );
}
