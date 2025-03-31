import { ColumnTopicModelingResultModel } from '@/api/topic';
import { client } from '@/common/api/client';
import { UseQueryWrapperComponent } from '@/components/utility/fetch-wrapper';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';

export const AllTopicModelingResultContext = React.createContext<
  ColumnTopicModelingResultModel[]
>(undefined as any);

export function useTopicModelingResultOfColumn(
  column: string,
): ColumnTopicModelingResultModel | undefined {
  const allTopics = React.useContext(AllTopicModelingResultContext);
  return allTopics.find(
    (textualColumn) => textualColumn.column.name === column,
  );
}

export function ProjectAllTopicsProvider(props: React.PropsWithChildren) {
  const { children } = props;
  const project = React.useContext(ProjectContext);
  const query = client.useQuery('get', '/topic/{project_id}/', {
    params: {
      path: {
        project_id: project.id,
      },
    },
  });
  return (
    <UseQueryWrapperComponent query={query}>
      {(data) => (
        <AllTopicModelingResultContext.Provider value={data.data}>
          {children}
        </AllTopicModelingResultContext.Provider>
      )}
    </UseQueryWrapperComponent>
  );
}
